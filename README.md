# CleanPath
CSSE Responsive Web App for Smart Waste Management System in Urban Area

## Overview

CleanPath is a full-stack project that provides a web frontend, a mobile collector app (Expo/React Native), and a Node.js + Express backend with MongoDB. The app helps WMAs (Waste Management Authorities), collectors, and users manage bins, garbage pickup schedules, transactions, and reports.

This README documents how to set up and run each part of the project, how to run tests, and highlights recent features and troubleshooting tips.

## Repository layout

- `backend/` — Express server, controllers, models, routes, and Jest tests.
- `frontend/` — React (Vite) web app using Tailwind CSS, Chart.js and jsPDF for reports.
- `cleanPathCollectorApp/` — Expo React Native collector app using NativeWind styles.

## Prerequisites

- Node.js (LTS recommended)
- npm (or pnpm/yarn if you prefer; instructions below use npm)
- MongoDB (local or hosted). Set `MONGO_URI` in environment.

## Environment variables

Create a `.env` file in the `backend/` folder (or set env vars in your environment) with the common variables used by the server, for example:

- `PORT=5000`
- `MONGO_URI=mongodb://localhost:27017/cleanpath`
- `JWT_SECRET=your_jwt_secret`

Adjust as necessary for your environment.

## Backend — install & run

1. Open a terminal and change to the backend folder:

```powershell
cd backend
npm install
```

2. Start the server (development):

```powershell
npm run dev
```

Notes:
- The project includes a test-only Express app at `backend/testServer.js`. Tests and some automation import this file (it mounts routes but does not call `listen()`), which prevents port conflicts when running Jest.

## Frontend (web) — install & run

1. Install deps and start dev server:

```powershell
cd frontend
npm install
npm run dev
```

2. Open the app in the browser via the Vite URL printed in the terminal (usually `http://localhost:5173`).

Features in the web frontend:
- Modern green/white theme across pages.
- "Delete" button for bins on the user bins page that sends a delete request to the backend.
- Transactions page supports an optional discount code mechanic: discount is calculated as 2% per selected bin (client-side) and reflected in totals.
- WMA pages contain "Generate Report" controls for Bins and Schedules. Charts are rendered using Chart.js and reports can be exported to PDF using jsPDF.

## Collector App (Expo) — install & run

1. Install dependencies and run Expo inside `cleanPathCollectorApp`:

```powershell
cd cleanPathCollectorApp
npm install
npm start
```

2. Open on a simulator or physical device using the Expo dev tools.

Notes:
- The collector app uses NativeWind (tailwind-like). A runtime Metro bundling issue with `@apply` in global CSS was fixed by replacing `@apply` with explicit CSS rules; if you customize styles, prefer utility classes or explicit declarations compatible with NativeWind.

## Tests

This repository includes Jest tests for the backend. Some test suites previously failed because the main `backend/index.js` called `app.listen()` when imported. To avoid this, tests now import `backend/testServer.js` (a non-listening Express app).

Run backend tests only (recommended to avoid React Native TS/TSX tests being picked up by a global Jest run):

```powershell
cd backend
npm test -- --runInBand
```

If your global Jest configuration attempts to run TypeScript/TSX tests from the mobile app, run the backend test suite directly (see above) or adjust `jest.config.cjs` to limit the testMatch patterns to `backend/tests/**/*.test.js`.

## Reports & PDF export

WMA reports (Bins and Schedules) are available in the WMA section of the web app. They use Chart.js to render visualizations and jsPDF to export charts to a two-page PDF. The export captures chart canvases and adds them to the generated PDF.

If charts render empty, verify that the page has fetched the necessary data (inspect developer tools' network tab) and try again.

## Recent notable fixes and features

- Fixed server-side bin deletion bug (use of Mongoose deletion API) and added a Delete button on the user bins page.
- Added discount code/discount calculation in the transactions UI (client-side: 2% per selected bin).
- Added WMA bins and schedules reports with Chart.js visualizations and jsPDF PDF download.
- Collector app: fixed Metro bundler runtime error caused by `@apply` in global CSS by replacing `@apply` with explicit CSS rules.
- Added `backend/testServer.js` so tests can import an Express app without starting a listener (prevents EADDRINUSE during Jest runs).

## Troubleshooting

- EADDRINUSE during tests: make sure tests import `backend/testServer.js` instead of `backend/index.js`. Run backend tests from the `backend` folder to avoid unrelated tests being picked up.
- Metro/Expo "Unknown at rule: @apply": remove `@apply` from runtime global CSS and use NativeWind utility classes or explicit CSS rules.
- Empty charts / PDF export problems: ensure Chart.js canvas elements are fully rendered before exporting. Use the UI button after charts appear.

## Contributing

If you'd like to contribute, please fork the repository and open a PR. For backend tests, prefer using `backend/testServer.js` for integration tests that use Supertest. Keep tests focused (unit tests for controller logic and small integration tests using the test server).

## Contact

For questions or help setting up the project, open an issue or contact the maintainers.

---

Thank you for using CleanPath. If you'd like, I can also add a short development checklist or a CONTRIBUTING.md file with more details.
