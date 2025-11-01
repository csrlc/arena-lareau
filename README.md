# Aréna Régional Lareau — GitHub Pages scaffold

This repository is a static site scaffold for deployment on GitHub Pages.

Structure created:
- index.html (home)
- /pages/content/navbar.html (fragment loaded by JS)
- /pages/content/footer.html (fragment loaded by JS)
- /pages/propos/*.html (contact, mission, equipe)
- /pages/location.html
- /pages/billets.html (redirect to external purchase site)
- /assets/styles/global.css
- /assets/scripts/global.js
- /assets/images/* (place assets images here)
- /assets/fonts/BlackOpsOne-Regular.ttf (reference; add the font file yourself)

How it works:
- The header and footer fragments are loaded client-side by `/assets/scripts/global.js`. This avoids server-side includes and works on static hosting such as GitHub Pages.
- The language toggle switches `data-current-language` and updates elements that have `data-i18n` and `data-i18n-json` attributes.
- The theme toggle toggles the `dark` class on `<html>` (you can extend CSS for `.dark` variables).
- An advertisement overlay is shown on page load using `/assets/images/hyperlink.png` (place your image there). It blurs and darkens the background.

To test locally:
- Use a simple static server in the workspace root, e.g. with Python 3:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```

Deploy to GitHub Pages by pushing to a repo and enabling Pages for the main branch (or gh-pages branch).
