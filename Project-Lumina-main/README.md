# ShadowFlow Intelligence Platform

> **Zero-Trust Identity & Financial Threat Intelligence**  
> A forensic-grade transaction analysis platform that maps hidden connections across 100K+ accounts — resolving aliases, detecting fraud rings, and scoring behavioral risk in under 2 seconds.

![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)

---

## ✨ Features

- **Dynamic Network Topology** — Interactive 2D force-directed graph rendering transaction flows and cluster relationships in real-time
- **Web Worker Engine** — Processes large datasets without freezing the UI using parallel Web Workers
- **Multi-Factor Risk Scoring** — Detects Circular Loops, Temporal Velocity, Statistical Anomalies, Synthetic Repetition, and Benign Utility patterns
- **Tiered Risk Classification** — Automatic Low / Medium / High risk categorization with explainable scores
- **Forensic Subject Dossier** — Deep-dive panel for individual account investigation
- **Zero-Trust Architecture** — Every identity is treated as suspect until proven otherwise

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/shadowflow-intelligence.git
cd shadowflow-intelligence

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Login

```
Operator ID : IDENTITY_LEAD
Passcode    : SECURE_2026
```

> ⚠️ This is a demo credential for local development only. Replace with a proper auth backend before deploying to production.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Secure access terminal
│   └── dashboard/page.tsx    # Main intelligence dashboard
├── components/
│   └── Dashboard/
│       ├── TransactionCanvas.tsx   # Force-directed graph
│       ├── IdentityDNA.tsx         # Data ingestion + risk engine
│       └── SubjectDossier.tsx      # Account forensics panel
├── store/
│   └── graphStore.ts         # Zustand global state
└── workers/
    └── identityResolver.worker.ts  # Web Worker for data processing
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Animations | Framer Motion |
| Graph | react-force-graph-2d |
| Data | xlsx (CSV/XLSX parsing) |
| Icons | lucide-react |

---

## 📊 Uploading Data

The dashboard accepts `.csv` and `.xlsx` transaction files with the following columns:

| Column | Description |
|---|---|
| `transaction_id` | Unique transaction identifier |
| `sender_account` | Source account ID |
| `receiver_account` | Destination account ID |
| `amount` | Transaction amount |
| `timestamp` | Date/time of transaction |

A sample dataset is included at `sample_transactions.csv`.

---

## 📜 License

MIT — free to use, modify, and distribute.

---

*ShadowFlow Intelligence © 2026 — Zero-Trust · Neural Mesh · v2.1*
