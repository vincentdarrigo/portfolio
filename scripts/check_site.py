"""Dependency-free source, local-link, and basic accessibility checks."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
import subprocess, tempfile, sys

ROOT = Path(__file__).resolve().parents[1]
problems = []
checks = 0

def check_js(source,label):
    global checks
    checks += 1
    with tempfile.NamedTemporaryFile(suffix='.js',mode='w',encoding='utf8',delete=False) as f:
        f.write(source); name=f.name
    result=subprocess.run(['node','--check',name],capture_output=True,text=True)
    Path(name).unlink()
    if result.returncode: problems.append(label+': invalid JavaScript\n'+result.stderr)

class Page(HTMLParser):
    def __init__(self,path):
        super().__init__(convert_charrefs=True)
        self.path=path; self.base=path.parent; self.ids=[]; self.refs=[]; self.script=None
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='base': self.base=(self.path.parent/a.get('href','')).resolve()
        if a.get('id'): self.ids.append(a['id'])
        if tag=='img' and 'alt' not in a: problems.append(str(self.path.relative_to(ROOT))+': image missing alt')
        for key in ('src','href','poster'):
            if key in a and tag!='base': self.refs.append(a[key])
        for key,value in a.items():
            if key.startswith('on') and value: check_js('(function(event){'+value+'\n})',str(self.path))
        if tag=='script' and 'src' not in a: self.script=''
    def handle_data(self,text):
        if self.script is not None: self.script+=text
    def handle_endtag(self,tag):
        if tag=='script' and self.script is not None:
            check_js(self.script,str(self.path)+': inline script');self.script=None

files=[p for p in ROOT.rglob('*') if p.is_file() and not any(x in p.parts for x in ('.git','node_modules'))]
for path in files:
    if path.suffix=='.js': check_js(path.read_text(encoding='utf8'),str(path))
    if path.suffix!='.html': continue
    page=Page(path);page.feed(path.read_text(encoding='utf8'))
    for ident,count in Counter(page.ids).items():
        if count>1: problems.append(f'{path.relative_to(ROOT)}: duplicate ID {ident}')
    for ref in page.refs:
        url=urlsplit(ref)
        if url.scheme or url.netloc or not url.path: continue
        target=(page.base/unquote(url.path)).resolve()
        if target.is_dir():target=target/'index.html'
        if not target.exists():problems.append(f'{path.relative_to(ROOT)}: missing local reference {ref}')
print('\n'.join(problems) if problems else f'PASS: {checks} JavaScript syntax checks; local HTML links/assets, unique IDs, and image alt presence.')
sys.exit(bool(problems))
