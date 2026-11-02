# SiliconEng company site

A responsive static site for SiliconEng's integrated circuit development and silicon engineering services. Firebase Hosting publishes the `public/` directory; the page has no build step.

Preview locally with `npm install` (first time), then `npm run dev`. Open http://127.0.0.1:5173. Saved changes in `public/` automatically refresh the browser. Stop the server with Ctrl+C.

Concept 4 is the homepage (`index.html`, styled by `concept-four.css` and `concept-four.js`). Concepts 1 and 2 are kept in `public/archive/` with their own CSS, scripts, and images (`archive/img/`): `archive/concept-1.html`, `archive/concept-2.html`, and Concept 1's resources page `archive/resources-1.html`. They work in local preview (for example http://127.0.0.1:5173/archive/concept-2.html) but are not deployed: `firebase.json` leaves `archive/` out of the upload, and on the live site the pages' old addresses (and `/concept-4.html`) redirect to the homepage. Careers, Contact, and Resources link home to `/`; opened with `?concept=1` or `?concept=2`, as the archive pages do, they link back to that archive page instead.

To make Concept 2 the homepage again, move `index.html` into `archive/` as `concept-4.html` (and `concept-four.css`, `concept-four.js` beside it), move `archive/concept-2.html` to `public/index.html`, change the `?concept=2` links in the new `index.html` to plain links, and move the `archive/` files and images it uses back to their `public/` and `public/img/` locations, updating its `/archive/` paths to match.

The resume form on the Careers page has a file field (PDF, DOC, or DOCX, up to 10 MB), but the site has no upload backend yet, so submitting opens a prepared email to careers@siliconeng.com and asks the applicant to attach the same file.

Images on the live pages are WebP copies sized for how large they display; the full-size originals and unused earlier versions are kept in `originals/`, outside `public/`, so they are never uploaded. `public/img/` holds only files the live pages use; when you add a new image, keep the original in `originals/` and put a compressed copy in `public/img/`. The hero video is `img/hero-reel-hd-v2.mp4`, a muted 1080p H.264 copy of the 2K upscale `originals/hero-reel-source-2k-v2.mp4` (ffmpeg `-an -vf scale=1920:1080:flags=lanczos -c:v libx264 -preset veryslow -crf 27 -movflags +faststart`); its poster `img/hero-reel-hd-v2-poster.webp` is the copy's first frame. The first 2K upscale and its web copy (`originals/hero-reel-source-2k.mp4`, `originals/hero-reel-hd.mp4`) are kept but not uploaded. The source is an edit of two AI clips: the first, with its opening second cut, and the circuit-board shot from the second in place of the first's, which had a camera rig in frame. The 720p edit (`originals/hero-reel-source.mp4`) and its earlier web copy (`originals/hero-reel.mp4`) are kept but not uploaded. It starts loading only after the rest of the page; with Save-Data, a 2G connection, or reduced motion, it waits until someone presses Play.

`firebase.json` lets browsers keep images, video, and PDFs for 30 days and fonts for a year; HTML, CSS, and JavaScript are checked for changes on every visit. A returning visitor can therefore see an old image for up to 30 days after it is replaced under the same name, so give a replacement image or video a new file name.

The Resources page (`/resources-2.html`) lists the white papers in `public/whitepapers/`. Case studies appear only as disabled "Coming soon" buttons in the header and hero; replace those with links and add a section when the first case study is ready.

Deploy with `firebase deploy --only hosting`.

The logo and microprocessor image are served from `public/img/`. Contact details and service copy came from the supplied company information; confirm the final copy with SiliconEng before launch.
