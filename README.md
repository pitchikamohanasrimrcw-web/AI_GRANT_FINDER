# AI Grant & Funding Finder For Startups

## Overview
AI-powered Agentic AI platform built using IBM watsonx Orchestrate, IBM Granite Models,
and IBM Cloud Lite services to help startups discover grants, investors, incubators,
accelerators, and funding opportunities efficiently.

The system uses intelligent AI agents to analyze startup requirements, recommend
suitable funding programs, perform eligibility analysis, and generate proposal
guidance using IBM Granite models.

This project has two moving pieces:
1. **Embedded watsonx Orchestrate chat widget** — already wired up in `frontend/index.html`.
   This is the multi-agent conversational assistant.
2. **"Try AI Funding Search" demo box** — previously just showed a hardcoded string.
   It now calls a small Node/Express backend (`backend/server.js`) which talks
   directly to a IBM watsonx.ai Granite model to generate real funding suggestions.

---

## Project Structure

```
AI-Grant-Funding-Finder/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── README.md
```

---

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# then edit .env and add your real IBM_API_KEY and PROJECT_ID
npm start
```

The server runs on `http://localhost:3000` by default and exposes:
- `POST /api/find-funding` — body: `{ "query": "fintech startup" }`
- `GET /api/health` — health check

### Getting the required credentials
- `IBM_API_KEY`: IBM Cloud → Manage → Access (IAM) → API keys → Create.
- `PROJECT_ID`: watsonx.ai → your project → Manage → General → Project ID.
- `REGION`: the region your watsonx.ai project/service is provisioned in
  (e.g. `us-south`, `eu-de`, `au-syd`).
- `MODEL_ID`: any Granite model available in your project
  (e.g. `ibm/granite-3-2-8b-instruct`).

**Never commit your real `.env` file or share your API key.** `.gitignore`
already excludes it.

---

## Frontend Setup
No build step required — plain HTML/CSS/JS.

1. Open `frontend/index.html` directly in a browser, or serve it with any
   static server, e.g.:
   ```bash
   cd frontend
   npx serve .
   ```
2. Make sure the backend (above) is running first, since the demo search box
   calls `http://localhost:3000/api/find-funding`.
3. If you deploy the backend elsewhere, update `API_BASE_URL` at the top of
   `frontend/script.js`.

---

## Features
- Funding Opportunity Discovery
- Eligibility Analysis (via watsonx Orchestrate agent)
- AI Proposal Generation (via watsonx Orchestrate agent)
- Live Granite-powered funding suggestions in the demo search box
- Multi-Agent AI Workflow (watsonx Orchestrate)

---

## Technologies Used
- IBM watsonx Orchestrate
- IBM Granite Models (via watsonx.ai)
- IBM Cloud Lite
- Node.js / Express
- HTML / CSS / JavaScript

---

## Workflow
User → Frontend → Backend (Node/Express) → watsonx.ai (Granite) → Funding Recommendations
User → Embedded Chat Widget → watsonx Orchestrate → AI Agents → Granite Models → Responses

---

## Troubleshooting

**Embedded chat widget shows "Authentication Error / This content couldn't
be loaded due to a temporary issue":**
This is an IBM Cloud-side setting, not a bug in these files. Embed security
is turned on for your watsonx Orchestrate instance but no signing key has
been registered. Fix it in the IBM Cloud console:
1. Open your watsonx Orchestrate instance.
2. Go to **Settings (profile icon) → Embed Security** tab.
3. Turn the **Security** switch **Off** (fine for demos/prototypes with no
   sensitive data), then refresh `index.html`.

If the widget needs to stay secured, generate an RS256 key pair, register
the **public** key on that same tab, and sign requests server-side with the
private key — never put the private key in the frontend HTML/JS.

`frontend/index.html` already includes a fallback banner that shows a
friendlier message on the page if this widget fails to authenticate, so the
rest of the site stays usable while you fix the setting above.

---

## Developed As
IBM Agentic AI Academic Project using IBM watsonx Orchestrate and IBM Granite Models.
