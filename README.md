# SiliconEng company site

A responsive static site for SiliconEng's integrated circuit development and silicon engineering services. Firebase Hosting publishes the `public/` directory; the page has no build step.

Preview locally with `npm install` (first time), then `npm run dev`. Open http://127.0.0.1:5173. Saved changes in `public/` automatically refresh the browser. Stop the server with Ctrl+C.

Concept 2 is the default homepage. Concept 1 is preserved at `/concept-1.html`; existing `/?concept=1` links redirect there. The bottom selector switches between Concepts 2, 3, and 4; `/?concept=3` and `/?concept=4` redirect to `/concept-3.html` and `/concept-4.html`. The homepage does not load the other concepts' pages, videos, or separate styles and scripts.

Concepts 2, 3, and 4 share the Careers page at `/careers.html?concept=N`, which links back to the concept it came from. The resume form has a file field (PDF, DOC, or DOCX, up to 10 MB), but the site has no upload backend yet, so submitting opens a prepared email to careers@siliconeng.com and asks the applicant to attach the same file.

The Resources page (`/resources-2.html`) lists the white papers in `public/whitepapers/`. Case studies appear only as disabled "Coming soon" buttons in the header and hero; replace those with links and add a section when the first case study is ready.

Deploy with `firebase deploy --only hosting`.

The logo and microprocessor image are served from `public/img/`. Contact details and service copy came from the supplied company information; confirm the final copy with SiliconEng before launch.
