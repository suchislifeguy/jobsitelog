# JobSite Log (Static Web App)

A purely client-side web application for contractors and handymen to log tasks, estimate jobs, and generate PDF reports.

## Features
- **Zero Backend**: All data is saved to your browser's LocalStorage.
- **Zero Build Step**: Uses Babel Standalone to run `.tsx` files directly in the browser.
- **Offline Capable**: Installable as a PWA on mobile devices.
- **Privacy Focused**: No API keys, no accounts, no tracking.

## How to Deploy (GitHub Pages)

Since this is a static site, you do not need Node.js or NPM.

1. **Upload Files**: Upload all files in this folder to a GitHub Repository.
2. **Settings**: Go to the Repository Settings > **Pages**.
3. **Source**: Select `Deploy from a branch` and choose `main` (or `master`) and `/ (root)`.
4. **Save**: Wait a moment, and GitHub will provide you with a website link (e.g., `yourname.github.io/jobsitelog`).

## How to Run Locally (Computer)

Because this app uses ES Modules, you cannot simply double-click `index.html` (browsers block file system imports for security). You must serve it via a local web server.

**Option A: VS Code (Easiest)**
1. Open the folder in VS Code.
2. Install the "Live Server" extension.
3. Right-click `index.html` and choose "Open with Live Server".

**Option B: Python**
1. Open a terminal in this folder.
2. Run: `python3 -m http.server`
3. Open `http://localhost:8000` in your browser.

## How to Install on Mobile

1. Visit your deployed website link on your phone.
2. Tap **Share** (iOS) or **Menu** (Android).
3. Select **Add to Home Screen**.
4. The app will install as a standalone icon and launch without the browser address bar.
