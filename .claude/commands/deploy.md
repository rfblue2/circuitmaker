# Deploy circuitmaker to GitHub Pages

Builds the app and pushes the `dist/` output to the `gh-pages` branch, which GitHub Pages serves at https://rfblue2.github.io/circuitmaker/.

## Steps

1. **Build** the production bundle:
   ```bash
   npm run build
   ```

2. **Push dist/ to gh-pages** as an orphan commit:
   ```bash
   cd dist && git init && git checkout -b gh-pages && git add . && git commit -m "Deploy to GitHub Pages" && git push -f git@github.com:rfblue2/circuitmaker.git gh-pages && cd .. && rm -rf dist/.git
   ```

3. **Commit and push source** (if there are source changes to save):
   ```bash
   git add .
   git commit -m "<message>"
   git push
   ```

## Notes

- `vite.config.js` sets `base: '/circuitmaker/'` so all asset paths resolve correctly under the slug.
- GitHub Pages is configured to serve from the `gh-pages` branch root (`/`).
- The `dist/` folder is gitignored on `master` — only the orphan `gh-pages` branch holds it.
- GitHub typically takes ~1 minute to go live after a push.

## Local dev / preview

```bash
npm run dev      # dev server at http://localhost:5173/circuitmaker/
npm run preview  # preview the production build locally after `npm run build`
```
