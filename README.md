# go.alvadorn.org

This repository contains the static vanity import site for Alvadorn's Go modules.
It is published through GitHub Pages at [go.alvadorn.org](https://go.alvadorn.org).

The site lets Go modules use stable import paths under `go.alvadorn.org` while
keeping their source repositories on GitHub. For example:

```text
go.alvadorn.org/pigeon
```

resolves to:

```text
https://github.com/alvadorncorp/pigeon-go
```

## Adding a module

Edit [`modules.json`](modules.json) and add an entry with:

- `modulePath`: the path after `go.alvadorn.org/`
- `repo`: the complete HTTPS URL of the Git repository, without `.git` or a trailing slash.
  Private modules may use `ssh://git@github.com/owner/repo` so `go get` clones via the
  user's SSH key.
- `importRoot` (optional): for a module that lives in a subdirectory of the repo
  (a nested module), the module path of the repo root. The `go-import` meta tag must
  declare this root prefix so `go get` maps versions to `<dir>/vX.Y.Z` tags inside the
  repo — otherwise it checks out the root-level tag and fails with
  "module declares its path as ... but was required as ...".

Example:

```json
[
  {
    "modulePath": "pigeon",
    "repo": "https://github.com/alvadorncorp/pigeon-go"
  }
]
```

Commit and push the change to `main`. GitHub Actions regenerates the site and
deploys it to GitHub Pages automatically.

## Local generation

The generator requires only Node.js and has no external dependencies:

```bash
node scripts/generate.js
```

The generated site is written to `dist/`, which is ignored by Git. Each module
gets an `index.html` containing the `go-import` metadata required by the Go
 toolchain, and the root page contains a human-readable module listing.

## Repository layout

- `modules.json` — source-of-truth module-to-repository mappings
- `scripts/generate.js` — static site generator
- `scripts/module.tmpl.html` — per-module vanity page template
- `scripts/index.tmpl.html` — root listing page template
- `.github/workflows/pages.yml` — GitHub Pages build and deployment workflow
- `CNAME` — custom GitHub Pages domain
