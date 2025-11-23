# Walkthrough - Potter Quiz App

I have set up a React environment using Vite and Tailwind CSS to run the Potter Quiz application.

## Changes
- Converted the project to a Vite + React application.
- Installed dependencies: `react`, `react-dom`, `lucide-react`, `tailwindcss`, `vite`.
- Configured Tailwind CSS v3 (downgraded from v4 due to stability issues).
- Moved the application code to `src/App.jsx`.
- Implemented non-repeating questions logic by shuffling the repository once at the start.
- Added an Error Boundary to `src/main.jsx` for better debugging.

## Verification
- The application is running at [http://localhost:5173/](http://localhost:5173/).
- Verified that the app loads and displays "Potter Quiz".
- Verified that the "Nothing shows" issue is resolved (caused by a missing state variable).

## How to Run
If you stop the server, you can restart it with:
```bash
npm run dev
```
