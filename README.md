# keisha9.github.io

Keisha Kaba's personal site, served by GitHub Pages at <https://keisha9.github.io>.

It's plain HTML, CSS, and JavaScript with no build step.

## Structure

```
.
├── index.html          Home page
├── 404.html            GitHub Pages error page (uses root-relative paths)
├── *.html              Other pages, kept at the root so their URLs stay stable
└── assets/
    ├── css/style.css
    ├── js/site.js
    └── img/
```

## Preview locally

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.
