# Vince Darrigo’s portfolio

A buildless HTML, CSS, and JavaScript site hosted on GitHub Pages.

## Preview

From this directory, run `python -m http.server 8801 --bind 127.0.0.1`, then visit `http://localhost:8801/`.

## Structure

- `index.html` contains the overview, work index, two case studies, the Systems Map, process, experience, and about views.
- `js/site.js` selects a view using a hash route, updates page titles and navigation, and remembers the theme when storage is available. Without JavaScript, the main content remains in document order.
- `css/site.css` supplies the responsive layout and both themes.
- `retro/` is an optional interactive desktop. `desktop.js` owns window state; individual app scripts initialize when their windows open; `usability.js` supplies keyboard activation, window recovery, and visitor controls. Keep script order in `retro/index.html` intact.
- `retro/guestbook.html` is a browser-local demonstration. Comments are not transmitted to a server. Starter comments and social statistics are fictional.
- `#/work/systems-map` is a static, synthetic diagram of how Python connects business systems and where an optional, human-reviewed AI step fits. `js/systems-map.js` highlights a scenario's path; without JavaScript every scenario's notes show and the diagram is unhighlighted. Nothing on it calls a model or a live system. Each scenario's `data-nodes` / `data-edges` must name elements on both diagrams (the wide SVG and the phone stack). The retired `#/lab` route redirects here.
- The small Gateway computer on About opens a native dialog. Clicking the enlarged computer starts the retro site. Escape, X, or the backdrop closes the preview; without JavaScript the small computer is a direct link.
- `downloads/vince-darrigo-resume.pdf` contains only the approved public portfolio facts.
- `work/operations-platform/` and `work/learning-platform/` are standalone, shareable case-study pages with their own metadata. They also remain readable without JavaScript.

## Updating case studies

Edit their content in `index.html`, then run `python scripts/build_pages.py`. Commit the two generated pages with the source. The generator preserves the main shell and uses a relative base URL so assets and navigation work under the GitHub Pages repository path.

## Desktop behavior

Sound and automatic extras start off. The toolbar enables them separately. Open desktop icons with a double click, a touch tap, or Enter/Space. Search the Start menu to find programs. Reading windows support maximize/restore, and Arrange windows recovers their positions. Snake and Tetris pause when closed or minimized.

The desktop also suspends weather clocks, simulated download progress, pet updates, the Minesweeper clock, and Winamp visual work when their windows are closed/minimized or the document is hidden. Audio the visitor explicitly started can continue; reopening resumes the visible work. Paint uses pointer events with canvas coordinate scaling for mouse, pen, and touch.

Project links such as `retro/index.html#ispyai` open the matching window after boot. The lock puzzle is an Easter egg, not authentication: its source and all content are public. Never put private data or credentials behind it.

## Validation

Run:

```
python scripts/build_pages.py --check
python scripts/check_site.py
node scripts/systems-map.test.cjs
```

The GitHub workflow runs these on pushes and pull requests. It checks JavaScript syntax (including inline handlers), duplicate IDs, local HTML links/assets, basic image alt presence, generated-page freshness, and the Systems Map scenarios. These are basic structural checks, not a complete accessibility audit. Review every main route in both themes at desktop and phone sizes. Check keyboard navigation, local assets, production/prototype wording, and client confidentiality before publishing. Source-code checks do not replace interaction testing.
