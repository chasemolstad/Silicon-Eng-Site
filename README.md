# SiliconEng company site

A responsive static site for SiliconEng's integrated circuit development and silicon engineering services. Firebase Hosting publishes the `public/` directory; the page has no build step.

Preview locally with `npm install` (first time), then `npm run dev`. Open http://127.0.0.1:5173. Saved changes in `public/` automatically refresh the browser. Stop the server with Ctrl+C.

Concept 2 is the default homepage. Concept 1 is preserved at `/concept-1.html`; existing `/?concept=1` links redirect there. The bottom selector lists only Concept 2, and its homepage does not load Concept 1's page, video, or separate styles and scripts.

Deploy with `firebase deploy --only hosting`.

The logo and microprocessor image are served from `public/img/`. Contact details and service copy came from the supplied company information; confirm the final copy with SiliconEng before launch.
