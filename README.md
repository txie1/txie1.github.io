# txie1.github.io

Personal homepage of Tong Xie, built with [Jekyll](https://jekyllrb.com/) and a customized
[Minimal Light](https://github.com/yaoyao-liu/minimal-light) theme.

## Editing

- Profile, links, link-preview image and feature switches (`style_*`): `_config.yml`
- Bio and news: `index.md`
- Publications: `_data/publications.yml` (thumbnails in `assets/img/publications/`)
- More page: `more.md` (photos in `assets/img/more/`; page-size copies in `assets/img/more/web/`)
- Top-right menu: `_data/navigation.yml`
- Layout: `_layouts/homepage.html`; styles: `_sass/`; scripts: `assets/js/`
- Visitor statistics: `goatcounter` in `_config.yml` (dashboard at https://txie1205.goatcounter.com);
  the counted events are listed at the top of `assets/js/stats.js`

Give new images their real `width`/`height` (or `image_size` in `publications.yml`) so the page
doesn't shift while they load.

## Local preview

```bash
bundle config set --local path vendor/bundle
bundle install
bundle exec jekyll serve   # http://localhost:4000
```

## Deploying

Pushing to `master` runs `.github/workflows/deploy.yml`, which builds the site and publishes it
to the `gh-pages` branch that GitHub Pages serves.
