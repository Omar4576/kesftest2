# Kesf — Discover Azerbaijan

Kesf ("Discovery" in Azerbaijani) is a Yelp-style discovery platform for Azerbaijan, covering Baku, Ganja, Sheki, and Quba. It's a single-page application (SPA) built with vanilla HTML/CSS/JavaScript — no build step required.

## Features

- **Browse & search** restaurants, tea houses, sports/football venues, hotels, nightlife, kids & family spots, cinemas, car washes, and activities across 4 cities
- **52+ real, curated listings** with addresses, phone numbers, ratings, hours, prices, tags, and photos
- **Filters**: by city, category, price, and sort order
- **Place detail pages** with photos, info sidebar, map link, share buttons, and similar-places suggestions
- **User accounts**: sign up / log in, save (bookmark) places, write & read reviews
- **Business accounts**: separate registration flow, business dashboard to manage listing info
- **Client-side security basics**: password hashing (non-cryptographic, demo-grade), input sanitization, rate-limiting on login attempts, session expiry (7 days)
- **SPA router** with clean URLs (History API) and a GitHub Pages 404 fallback so deep links work

## Running locally

No build tools needed. Just serve the folder statically, e.g.:

```bash
cd kesf
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

> Opening `index.html` directly via `file://` will mostly work, but some browsers restrict `localStorage` under `file://` — use a local server for the full experience.

## Deploying to GitHub Pages

1. Push this `kesf` folder's contents to the root of a GitHub repository (or to a `docs/` folder, or `gh-pages` branch — your choice).
2. In repo Settings → Pages, set the source to that branch/folder.
3. The included `404.html` handles SPA deep-linking: if someone visits `/place/3` directly, GitHub Pages serves `404.html`, which redirects back to `index.html` and the router restores the intended route.

## Project structure

```
kesf/
├── index.html          # App shell / entry point
├── 404.html            # GitHub Pages SPA fallback
├── css/
│   └── main.css        # Full design system & styles
└── js/
    ├── data.js          # Places, categories, cities data
    ├── auth.js           # Auth, sessions, reviews, bookmarks (localStorage)
    ├── components.js     # Reusable UI components (cards, modals, nav, footer)
    ├── router.js          # SPA router (History API)
    ├── pages.js           # Page renderers (home, explore, city, place, profile, dashboard...)
    └── app.js             # App controller (init, search, filters, auth modals)
```

## Notes on data & storage

- All data (`PLACES_DATA`, `CATEGORIES`, `CITIES`) lives in `js/data.js`. To add a new city or place, add an entry there — the UI picks it up automatically (filters, counts, city pages, etc. are all data-driven).
- User accounts, sessions, reviews, and bookmarks are stored in the browser's `localStorage`. This is a front-end-only demo; for production use you'd replace `js/auth.js`'s storage calls with real API calls to a backend with proper hashed passwords (bcrypt/argon2), HTTPS-only sessions, and a database.

## Adding more cities / places

Open `js/data.js`:

1. Add a new city object to the `CITIES` array (`id`, `name`, `nameAz`, `description`, `population`, `icon`).
2. Add an array of place objects under `PLACES_DATA[cityId]`, following the existing shape (`id`, `name`, `category`, `subcategory`, `city`, `address`, `phone`, `rating`, `reviews`, `price`, `tags`, `description`, `hours`, `image`, `lat`, `lng`, `verified`, `popular`, `photos`).

Everything else (routing, filters, city pages, search) updates automatically.
