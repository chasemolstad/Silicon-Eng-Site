# SiliconEng company site

A responsive static site for SiliconEng's integrated circuit development and silicon engineering services. Firebase Hosting publishes the `public/` directory; the page has no build step.

Preview locally with `npm install` (first time), then `npm run dev`. Open http://127.0.0.1:5173. Saved changes in `public/` automatically refresh the browser. Stop the server with Ctrl+C.

Concept 4 is the homepage (`index.html`, styled by `concept-four.css` and `concept-four.js`). Concepts 1 and 2 are kept as archive pages, `concept-1.html` and `concept-2.html`, with Concept 1's resources page at `resources-1.html`. They work in local preview but are not deployed: `firebase.json` leaves them out of the upload, and on the live site their old addresses (and `/concept-4.html`) redirect to the homepage. Careers, Contact, and Resources link home to `/`; opened with `?concept=1` or `?concept=2`, as the archive pages do, they link back to that archive page instead.

To make Concept 2 the homepage again, rename `index.html` to `concept-4.html` and `concept-2.html` to `index.html`, change the `?concept=2` links in the new `index.html` to plain links, and remove Concept 2's files (`concept-2.html`, `concept-two.css`, `concept-two.js`) from the `ignore` list in `firebase.json`. Concept 2 also uses the original logo and poster images listed there.

The resume form on the Careers page has a file field (PDF, DOC, or DOCX, up to 10 MB), but the site has no upload backend yet, so submitting opens a prepared email to careers@siliconeng.com and asks the applicant to attach the same file.

Images on the live pages are WebP copies sized for how large they display; the full-size originals stay in `public/img/` and are listed in the `ignore` section of `firebase.json`, so they are not uploaded. When you add a new original, add it to that list and point the page at a compressed copy. The hero video starts loading only after the rest of the page; with Save-Data, a 2G connection, or reduced motion, it waits until someone presses Play.

`firebase.json` lets browsers keep images, video, and PDFs for 30 days and fonts for a year; HTML, CSS, and JavaScript are checked for changes on every visit. A returning visitor can therefore see an old image for up to 30 days after it is replaced under the same name, so give a replacement image or video a new file name.

The Resources page (`/resources-2.html`) lists the white papers in `public/whitepapers/`. Case studies appear only as disabled "Coming soon" buttons in the header and hero; replace those with links and add a section when the first case study is ready.

Deploy with `firebase deploy --only hosting`.

The logo and microprocessor image are served from `public/img/`. Contact details and service copy came from the supplied company information; confirm the final copy with SiliconEng before launch.
