import './style.css';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1MVqfQNwMvpAWBQoN1-f_PQlhokXoAD8-dkT8c1veBHk/edit#gid=0';

// Mock data fallback in case the sheet is not accessible
const MOCK_DATA = [
  { Name: "Alex Chen", Score: 9850 },
  { Name: "Sarah Jenkins", Score: 9200 },
  { Name: "Mike Ross", Score: 8900 },
  { Name: "Emma Watson", Score: 8400 },
  { Name: "David Kim", Score: 8150 },
  { Name: "Jessica Alba", Score: 7900 },
  { Name: "Robert Fox", Score: 7600 },
  { Name: "Jane Doe", Score: 7100 }
];

let fireworksInterval = null;

function stopContinuousFireworks() {
  if (fireworksInterval) {
    clearInterval(fireworksInterval);
    fireworksInterval = null;
  }
}

function getCsvUrl(inputUrl) {
  if (!inputUrl) return '';
  const url = inputUrl.trim();
  if (url.includes('/export?format=csv')) {
    return url;
  }
  const sheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!sheetIdMatch) {
    throw new Error("Invalid Google Sheets URL. Could not extract spreadsheet ID.");
  }
  const sheetId = sheetIdMatch[1];
  let gid = '0';
  const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
  if (gidMatch) {
    gid = gidMatch[1];
  }
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

// DOM Selectors
const setupContainer = document.getElementById('setup-container');
const dashboardContainer = document.getElementById('dashboard-container');
const setupForm = document.getElementById('setup-form');
const sheetUrlInput = document.getElementById('sheet-url-input');
const submitBtn = document.getElementById('submit-btn');
const demoBtn = document.getElementById('demo-btn');
const changeSheetBtn = document.getElementById('change-sheet-btn');
const errorMessage = document.getElementById('error-message');

function setLoading(isLoading) {
  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="loader-spinner"></span>
      <span>Fetching...</span>
    `;
    demoBtn.disabled = true;
  } else {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Fetch Leaderboard</span>`;
    demoBtn.disabled = false;
  }
}

function showError(message) {
  errorMessage.innerHTML = message;
  errorMessage.style.display = 'block';
  errorMessage.style.animation = 'none';
  errorMessage.offsetHeight; // Reflow
  errorMessage.style.animation = 'shake 0.5s ease-in-out';
}

function hideError() {
  errorMessage.style.display = 'none';
  errorMessage.innerHTML = '';
}

function showDashboard() {
  setupContainer.style.display = 'none';
  dashboardContainer.style.display = 'block';
}

function showSetup() {
  dashboardContainer.style.display = 'none';
  setupContainer.style.display = 'block';
  stopContinuousFireworks();
}

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // Ease out quad
    const easeProgress = 1 - (1 - progress) * (1 - progress);
    
    obj.innerHTML = Math.floor(easeProgress * (end - start) + start).toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end.toLocaleString();
    }
  };
  window.requestAnimationFrame(step);
}

function renderLeaderboard(data) {
  // Ensure data has Name and Score, and parse Score as number
  let participants = data.map(row => ({
    Name: row.Name || 'Unknown',
    Score: parseInt(row.Score || 0, 10)
  }));

  // Sort descending by score
  participants.sort((a, b) => b.Score - a.Score);

  const podiumContainer = document.getElementById('podium-container');
  const listItemsContainer = document.getElementById('list-items');
  const statusMessage = document.getElementById('status-message');
  
  if (statusMessage) {
    statusMessage.style.display = 'none';
  }

  podiumContainer.innerHTML = '';
  listItemsContainer.innerHTML = '';

  // Get Top 3
  // Order for visual podium: 2nd, 1st, 3rd
  const top3 = participants.slice(0, 3);
  const visualOrder = [
    { rank: 2, data: top3[1] },
    { rank: 1, data: top3[0] },
    { rank: 3, data: top3[2] }
  ];

  visualOrder.forEach(item => {
    if (!item.data) return; // In case there are less than 3 participants
    
    const initial = item.data.Name.charAt(0).toUpperCase();
    
    const podiumEl = document.createElement('div');
    podiumEl.className = `podium-item rank-${item.rank}`;
    podiumEl.innerHTML = `
      <div class="podium-avatar-wrapper">
        <div class="podium-avatar">${initial}</div>
        <div class="rank-badge">${item.rank}</div>
      </div>
      <div class="podium-info">
        <div class="podium-name" title="${item.data.Name}">${item.data.Name}</div>
        <div class="podium-score" id="score-rank-${item.rank}">0</div>
      </div>
    `;
    podiumContainer.appendChild(podiumEl);

    // Animate score after a short delay to sync with container slide-up
    setTimeout(() => {
      const scoreEl = document.getElementById(`score-rank-${item.rank}`);
      if (scoreEl) {
        animateValue(scoreEl, 0, item.data.Score, 2000);
      }
    }, 1000);
  });

  // Render the rest (4th onwards)
  const rest = participants.slice(3);
  rest.forEach((participant, index) => {
    const rank = index + 4;
    const initial = participant.Name.charAt(0).toUpperCase();
    
    const listItem = document.createElement('div');
    listItem.className = 'list-item';
    listItem.style.animationDelay = `${0.8 + (index * 0.1)}s`; // Staggered entry
    
    listItem.innerHTML = `
      <div class="rank-col">#${rank}</div>
      <div class="name-col">
        <div class="list-avatar">${initial}</div>
        <span>${participant.Name}</span>
      </div>
      <div class="score-col" id="score-rank-${rank}">0</div>
    `;
    listItemsContainer.appendChild(listItem);

    // Animate score
    setTimeout(() => {
      const scoreEl = document.getElementById(`score-rank-${rank}`);
      if (scoreEl) {
        animateValue(scoreEl, 0, participant.Score, 1500);
      }
    }, 1200 + (index * 100));
  });

  // Start fireworks after a delay (once the podium animations are mostly done)
  setTimeout(() => {
    startContinuousFireworks();
  }, 2500);
}

function startContinuousFireworks() {
  stopContinuousFireworks();
  const duration = 15 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  fireworksInterval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      stopContinuousFireworks();
      return;
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // since particles fall down, start a bit higher than random
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#E07A46', '#3F2187', '#ffffff'] // IST colors
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#E07A46', '#3F2187', '#ffffff'] // IST colors
    });
  }, 250);
}

async function loadSheetData(rawUrl, isDemo = false, remember = false) {
  hideError();
  setLoading(true);
  
  let csvUrl;
  try {
    csvUrl = getCsvUrl(rawUrl);
  } catch (err) {
    setLoading(false);
    showError(`<strong>Error:</strong> ${err.message}`);
    return;
  }

  Papa.parse(csvUrl, {
    download: true,
    header: false,
    complete: (results) => {
      setLoading(false);
      if (results.data && results.data.length > 1) {
        // Remove the first row (headers)
        const dataRows = results.data.slice(1);
        
        // Map Column A (index 0) to Name and Column B (index 1) to Score
        const mappedData = dataRows
          .filter(row => row && row[0] && row[1]) // Filter out empty or incomplete rows
          .map(row => ({
            Name: row[0].trim(),
            Score: parseInt(String(row[1]).replace(/,/g, ''), 10) || 0
          }));

        if (mappedData.length > 0) {
          console.log("Successfully loaded data from Google Sheets!");
          if (!isDemo) {
            if (remember) {
              localStorage.setItem('leaderboard_sheet_url', rawUrl);
            } else {
              localStorage.removeItem('leaderboard_sheet_url');
            }
          }
          showDashboard();
          renderLeaderboard(mappedData);
        } else {
          handleLoadError(new Error("No valid participants found in the sheet. Make sure Column A has names and Column B has scores."));
        }
      } else {
        handleLoadError(new Error("Invalid data format or empty sheet."));
      }
    },
    error: (error) => {
      setLoading(false);
      handleLoadError(error);
    }
  });

  function handleLoadError(error) {
    console.error("Error loading sheet:", error);
    if (isDemo) {
      console.warn("Using fallback mock data for demo.");
      showDashboard();
      renderLeaderboard(MOCK_DATA);
    } else {
      showError(`
        <strong>Failed to load Google Sheet:</strong><br>
        1. Make sure your Google Sheet is shared as <strong>"Anyone with the link can view"</strong>.<br>
        2. Ensure the URL is copied correctly from your browser address bar.<br>
        3. Double check that Column A has participant names and Column B has scores.<br>
        <span style="font-size: 0.85rem; color: #B91C1C; margin-top: 0.5rem; display: block;">Details: ${error.message || 'Network request failed or CORS policy blocked access'}</span>
      `);
    }
  }
}

// Event Listeners
setupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const url = sheetUrlInput.value.trim();
  const remember = document.getElementById('remember-sheet-checkbox').checked;
  if (url) {
    loadSheetData(url, false, remember);
  }
});

demoBtn.addEventListener('click', () => {
  sheetUrlInput.value = DEFAULT_SHEET_URL;
  loadSheetData(DEFAULT_SHEET_URL, true, false);
});

changeSheetBtn.addEventListener('click', () => {
  localStorage.removeItem('leaderboard_sheet_url');
  sheetUrlInput.value = '';
  showSetup();
});

// Initialization
const savedUrl = localStorage.getItem('leaderboard_sheet_url');
if (savedUrl) {
  sheetUrlInput.value = savedUrl;
  loadSheetData(savedUrl, false, true);
} else {
  showSetup();
}
