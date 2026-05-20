# 🏆 IST Bootcamp Leaderboard

A stunning, real-time leaderboard web application that displays participant ranks and scores by fetching data directly from a Google Sheet. It features dynamic sorting, animated score counters, a stylized visual podium for the top 3, and interactive celebratory confetti.

---

## ✨ Features

- **Live Data Syncing**: Uses [PapaParse](https://www.papaparse.com/) to fetch and parse live CSV data from a Google Sheet.
- **Dynamic Leaderboard**: Automatically ranks participants in descending order based on their scores.
- **Animated Podium**: Displays the Top 3 participants in a visually appealing visual podium layout (2nd, 1st, 3rd) with scale animations.
- **Score Counter Animations**: Smoothly counts up scores when the page loads.
- **Continuous Confetti**: Triggers colorful particle celebrations upon rendering the final ranks using [canvas-confetti](https://github.com/catdad/canvas-confetti).
- **Graceful Fallback**: Automatically displays local mock data if the Google Sheet is private or offline.

---

## 🛠️ Tech Stack

- **Framework/Bundler**: [Vite](https://vite.dev/) (Vanilla JS / ESM)
- **Styling**: Vanilla CSS with custom CSS variables, gradients, glassmorphism, and keyframe animations
- **Libraries**:
  - `canvas-confetti` (for celebrations)
  - `papaparse` (for real-time Google Sheet integration)

---

## 🚀 Quick Start Guide

Follow these steps to set up and run the leaderboard on any system.

### 📋 Prerequisites

Ensure you have **Node.js** (version 18 or higher recommended) and **npm** installed on your system. You can verify this by running:

```bash
node -v
npm -v
```

### 📥 1. Clone & Navigate to the Project

1. Copy the codebase folder to your machine.
2. Open your terminal/command prompt.
3. Change your directory to the project folder:
   ```bash
   cd /path/to/Leadership
   ```

### 📦 2. Install Dependencies

Install the required packages defined in `package.json`:

```bash
npm install
```

### 💻 3. Run Locally (Development Server)

Start the local development server:

```bash
npm run dev
```

Once started, the terminal will show a local URL (usually `http://localhost:5173`). Open this URL in any modern web browser to view the live leaderboard!

### 🏗️ 4. Build for Production

To build optimized static files for deployment:

```bash
npm run build
```

This compiles your HTML, CSS, and JS into a production-ready `dist` folder. To preview the production build locally, run:

```bash
npm run preview
```

---

## ⚙️ How to Connect Your Own Google Sheet

By default, the leaderboard fetches data from an IST Bootcamp Google Sheet URL configured in the code. To connect your own Google Sheet:

1. **Prepare Your Google Sheet**:
   - Column **A** (first column, index `0`) must contain the **Names** of the participants.
   - Column **K** (eleventh column, index `10`) must contain their **Scores** (numbers).
   - Line `1` should be the header row (the application automatically skips it).

2. **Publish the Sheet**:
   - In Google Sheets, click the **Share** button in the top right corner.
   - Change General Access to **"Anyone with the link can view"** (this is critical to bypass CORS or authentication issues).

3. **Get the CSV Export Link**:
   - Copy your spreadsheet's unique ID from its URL.
     ```
     https://docs.google.com/spreadsheets/d/[YOUR_SPREADSHEET_ID]/edit#gid=0
     ```
   - Formulate the CSV export link like this:
     ```
     https://docs.google.com/spreadsheets/d/[YOUR_SPREADSHEET_ID]/export?format=csv&gid=0
     ```

4. **Update the URL in Code**:
   - Open [src/main.js](file:///Users/pranav/PRNV/Programs/Leadership/src/main.js) in your editor.
   - Locate the constant `SHEET_CSV_URL` at the top of the file:
     ```javascript
     const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/[YOUR_SPREADSHEET_ID]/export?format=csv&gid=0';
     ```
   - Replace the link with your custom CSV export link. Save the file, and the leaderboard will instantly reload with your live data!

---

## 📁 Directory Structure

```text
Leadership/
├── index.html          # Main HTML entrypoint (includes font imports & structure)
├── package.json        # Project metadata, dependencies, and build scripts
├── package-lock.json   # NPM dependency lockfile
├── public/             # Static public assets (logos, icons)
└── src/
    ├── main.js         # Core logic (fetches spreadsheet, ranks players, triggers animations)
    └── style.css       # Premium custom theme, layouts, glassmorphic styling, and animations
```
