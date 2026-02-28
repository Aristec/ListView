# Geological Localities Browser

A responsive Vue 3 application for browsing geological localities from
the public Geoloogia API.

This project was built as part of a frontend technical assignment.

------------------------------------------------------------------------

## 🛠 Tech Stack

-   Vue 3 (Composition API + `<script setup>`)
-   TypeScript
-   Vite
-   Tailwind CSS v4
-   Native Fetch API
-   Vitest (unit & component testing)
-   Vue Test Utils
-   Happy DOM

------------------------------------------------------------------------

## 📡 API

Data is fetched from:

https://rwapi.geoloogia.info/api/v1/public/localities/

Query parameters used:

-   `limit`
-   `offset`
-   `expand=country`
-   `name__icontains`

------------------------------------------------------------------------

## 🏗 Project Structure

src/ api/ client.ts localities.ts types.ts components/ LocalityList.vue
LocalityList.test.ts utils/ debounce.ts debounce.test.ts views/
HomeView.vue router/ index.ts

------------------------------------------------------------------------

## 🧠 Architecture Notes

-   API access is abstracted into a reusable client (`api/client.ts`)
-   Pagination state lives in `HomeView.vue`
-   `LocalityList.vue` is a presentational component
-   Search uses:
    -   Server-side filtering for `name`
    -   Client-side fallback for `name_en`
-   Request ID tracking prevents stale async responses
-   Pagination state is synced with search input
-   Testable architecture with isolated utilities and presentational
    components

------------------------------------------------------------------------

## 🧪 Testing

The project includes unit and component tests using **Vitest**.

### Tested Areas

-   `debounce` utility (timing behavior using fake timers)
-   `LocalityList` component rendering
    -   Empty state
    -   Name display
    -   ID display
    -   Expanded country display

### Run tests

``` bash
npm run test
```

Run tests once (CI mode):

``` bash
npm run test:run
```

Generate coverage report:

``` bash
npm run test:coverage
```

Coverage reports are generated using the V8 coverage provider.

------------------------------------------------------------------------

## ⚙️ Setup Instructions

### 1. Clone the repository

``` bash
git clone <your-repo-url>
cd <repo-name>
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Run development server

``` bash
npm run dev
```

App runs at:

http://localhost:5173

------------------------------------------------------------------------

## 📦 Build for Production

``` bash
npm run build
npm run preview
```

------------------------------------------------------------------------

## 📱 Responsiveness

-   Mobile-friendly layout
-   Responsive list layout
-   Adaptive pagination controls

------------------------------------------------------------------------

## 🔍 Possible Future Improvements

-   Detail view per locality
-   Leaflet map integration for coordinates
-   Numeric pagination buttons
-   E2E testing (Playwright / Cypress)
-   Deployment (e.g., Vercel / Netlify)
