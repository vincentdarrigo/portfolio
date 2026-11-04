"""Export shareable case-study pages from the main document. No runtime build required."""
from pathlib import Path
import re, sys
ROOT = Path(__file__).resolve().parents[1]
source = (ROOT/'index.html').read_text(encoding='utf8')
descriptions = {
 'operations-platform': 'An anonymized case study in Python integrations, data reconciliation, failure recovery, and operational software. Production and proposed work are labeled separately.',
 'learning-platform': 'A private learning-platform prototype: observable evidence, prompt-evaluation false positives, and teacher review. Includes an explicitly invented example.'
}
for slug, description in descriptions.items():
    route = '/work/'+slug
    article = re.search(r'<article class="view study" id="'+re.escape(route)+r'".*?</article>',source,re.S).group(0)
    title = re.search(r'data-title="([^"]+)"',article).group(1)+' · Vince Darrigo'
    recovery = re.search(r'<section class="view" id="/not-found".*?</section>', source, re.S).group(0)
    recovery = recovery.replace('<section ', '<section hidden ', 1)
    page = re.sub(r'(<main id="main"[^>]*>).*?(</main>)',lambda m:m[1]+'\n'+article+'\n'+recovery+'\n'+m[2],source,flags=re.S)
    page = page.replace('data-theme="dark"','data-theme="dark" data-route="'+route+'"',1)
    page = page.replace('<meta charset="utf-8">','<meta charset="utf-8">\n<base href="../../">',1)
    page = re.sub(r'<title>.*?</title>','<title>'+title+'</title>',page)
    for name in ['description','og:description']:
        page = re.sub(r'(<meta (?:name|property)="'+name+r'" content=")[^"]+',lambda m:m[1]+description,page)
    page = re.sub(r'(<meta property="og:title" content=")[^"]+',lambda m:m[1]+title,page)
    canonical = 'https://vincentdarrigo.github.io/portfolio/work/'+slug+'/'
    page = re.sub(r'(<meta property="og:url" content=")[^"]+',lambda m:m[1]+canonical,page)
    page = re.sub(r'(<link rel="canonical" href=")[^"]+',lambda m:m[1]+canonical,page)
    dest = ROOT/'work'/slug/'index.html';dest.parent.mkdir(parents=True,exist_ok=True)
    if '--check' in sys.argv:
        assert dest.exists() and dest.read_text(encoding='utf8') == page, f'Regenerate {dest.relative_to(ROOT)} with python scripts/build_pages.py'
    else:
        dest.write_bytes(page.replace('\n','\r\n').encode('utf8'))
print('Exported both case studies with distinct content and metadata.')
