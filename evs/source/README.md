# Potter Quiz

A React-based quiz application where answering questions correctly reveals a hidden character.

## Project Setup

This project was created with Vite, React, and Tailwind CSS.

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1.  Navigate to the project directory:
    ```bash
    cd path/to/potter-quiz
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Development

To start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`.

### Building for Production

To build the app for deployment:

```bash
npm run build
```

The built files will be in the `dist` folder.

## Deployment to GitHub Pages (Subdirectory)

If you are hosting this in a subdirectory of a GitHub repository (e.g., `sopwithcamel.github.io/potter-quiz`):

1.  Ensure `vite.config.js` has `base: './'`.
2.  **Manual Deployment**:
    - Build the project: `npm run build`
    - Commit the `dist` folder (remove `dist` from `.gitignore` if you want to commit it directly, though not recommended for source branches).
    - Or, better, use a GitHub Action to build and deploy.

### GitHub Action (Recommended)

Create a workflow file in your root repository `.github/workflows/deploy-potter-quiz.yml`:

```yaml
name: Deploy Potter Quiz

on:
  push:
    branches: ["main"]
    paths:
      - "potter-quiz/**" # Change this to your subdirectory name

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: 'npm'
          cache-dependency-path: potter-quiz/package-lock.json
      - name: Install dependencies
        run: npm ci
        working-directory: potter-quiz
      - name: Build
        run: npm run build
        working-directory: potter-quiz
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: potter-quiz/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Note**: This workflow assumes you are deploying *only* this app to GitHub Pages. If `sopwithcamel.github.io` hosts other content, you might need a different strategy (e.g., building to a specific folder in the `gh-pages` branch).
