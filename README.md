InstaGraph Analyst 🕵️‍♂️

A full-stack OSINT (Open Source Intelligence) tool for visualizing and analyzing Instagram account relationships. This application uses a force-directed graph to map connections, identifying mutual followers, bridges between networks, and potential high-risk profiles.

✨ Features

Interactive Node Graph: Visualize user connections with physics-based layout (force-directed).

Recursive Scraping: Configurable depth (L1, L2, L3) to find "followers of followers".

Relationship Mapper: Trace pathfinding between two disparate accounts to find mutual links.

Data Vault: A persistent database browser to inspect scraped profiles and connection logs.

Risk Profiling: Automated risk scoring based on account metadata anomalies.

Cloud Persistence: All data is stored in Firestore for historical analysis.

🚀 Getting Started

Prerequisites

Node.js (v16+)

A Firebase Project

Installation

Clone the repository:

git clone [https://github.com/yourusername/insta-graph-analyst.git](https://github.com/yourusername/insta-graph-analyst.git)


Install dependencies:

npm install


Configure Firebase:

Open src/App.jsx.

Replace the firebaseConfig object with your own credentials from the Firebase Console.

Start the development server:

npm run dev


🛠️ Usage

Login: Click "Initialize Session" to authenticate anonymously with Firebase.

Dashboard: View system stats and recent scrape jobs.

Graph Analyst: Enter a target username (e.g., elonmusk) and click Run Analysis.

Use the Settings tab to increase "Recursive Depth" for deeper scraping.

Data Vault: Switch to this view to see tabular data of all scraped profiles.

⚠️ Disclaimer

This tool is a simulation prototype. It generates mock data for demonstration purposes. Integrating real Instagram scraping requires adhering to Instagram's Terms of Service and usually requires official Graph API access or compliance with scraping laws.

📄 License

MIT
