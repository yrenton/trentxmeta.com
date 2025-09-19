# TrentXMeta.com

This repository contains the source files for **Trent X Meta**’s personal website and blog.

## About

The site is built as a simple static web project with no dependencies. It includes:

- A home page with a hero section, bio, and links to your social profiles.
- A blog with posts written in plain HTML. New posts can be added by placing an HTML file in `blog/posts/` and adding a corresponding entry to `blog/index.html`.
- Basic styling contained in `styles.css` and minimal JavaScript (`main.js`) for client‑side search on the blog page.
- SEO and social meta tags, an RSS feed (`feed.xml`) and sitemap (`sitemap.xml`).

## Adding New Blog Posts

1. Create a new HTML file in the `blog/posts/` directory following the existing pattern.
2. Update `blog/index.html` to include your new post with a title, summary and link.
3. (Optional) Update `sitemap.xml` and `feed.xml` with the new post’s URL and publish date.

## Deploying

This site is designed for hosting on [GitHub Pages](https://pages.github.com/). To deploy, push the contents of this repository’s root to the `main` branch and configure your repository’s Pages settings to serve from the root.

## License

The content in this repository is provided without warranty. Feel free to adapt the files for your own purposes.