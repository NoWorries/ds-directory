# ds-directory build pipeline

Single source of truth: `sites.json` (one object per site: org, ds, url).

Run `node scripts/build.js` from the repo root (with these files placed at
the repo root, replacing the old hand-written files) to regenerate:

- `index.html` (from templates/index.template.html)
- `sites/index.html` (from templates/sites.template.html)
- `annotations/annotations.xml`

## To install into ds-directory

1. Copy `sites.json`, `templates/`, `scripts/` into the repo root.
2. Add to `netlify.toml`:

   [build]
     command = "node scripts/build.js"

3. Delete the old hand-written index.html and sites/index.html — they're
   now generated, not source. Keep everything else (css, images, etc).
4. Commit and push — Netlify will run the build on the next deploy.

## Note

The annotations.xml this produces is ~52KB, still over Google's documented
30KB limit for annotations files. Worth checking in the Control Panel
whether it's actually being accepted before relying on it — if not, the
next step is consolidating some per-page annotations into broader
domain-level wildcard patterns.
