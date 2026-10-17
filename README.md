# Company site starter

A small static landing page ready for Firebase Hosting. There is no build step.

## Before publishing

Replace `YOUR COMPANY` and `hello@yourcompany.com` in `index.html` with the company's approved name and contact address. Update the page title and description in the document head as well.

## Set up Firebase Hosting

1. Install the Firebase CLI: `npm install -g firebase-tools`
2. Sign in: `firebase login`
3. From this folder, connect your Firebase project: `firebase use --add`
4. Preview locally: `firebase emulators:start --only hosting`
5. Deploy: `firebase deploy --only hosting`

The selected Firebase project is saved in `.firebaserc`.
