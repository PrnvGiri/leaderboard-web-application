import './style.css';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';

// The URL of the Google Sheet exported as CSV
// The user's Google Sheet URL modified for direct CSV download.
// NOTE: For this to work without CORS/Auth issues, the sheet must be set to "Anyone with the link can view".
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1MVqfQNwMvpAWBQoN1-f_PQlhokXoAD8-dkT8c1veBHk/export?format=csv&gid=0';

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

document.querySelector('#app').innerHTML += `
  <div id="status-message" style="text-align: center; color: var(--text-dim); margin-bottom: 1rem;">
    Loading live data...
  </div>
`;

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
  const duration = 15 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
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

async function loadData() {
  const statusMessage = document.getElementById('status-message');
  
  try {
    Papa.parse(SHEET_CSV_URL, {
      download: true,
      header: false,
      complete: (results) => {
        if (results.data && results.data.length > 1) {
          // Remove the first row (headers)
          const dataRows = results.data.slice(1);
          
          // Map Column A (index 0) to Name and Column K (index 10) to Score
          const mappedData = dataRows
            .filter(row => row && row[0] && row[10]) // Filter out empty or incomplete rows
            .map(row => ({
              Name: row[0].trim(),
              Score: parseInt(String(row[10]).replace(/,/g, ''), 10) || 0
            }));

          if (mappedData.length > 0) {
            console.log("Successfully loaded data from Google Sheets!");
            renderLeaderboard(mappedData);
          } else {
            throw new Error("No valid participants found in the sheet.");
          }
        } else {
          throw new Error("Invalid data format or empty sheet.");
        }
      },
      error: (error) => {
        console.warn("Could not fetch live Google Sheet (it might not be public). Using mock data.", error);
        if (statusMessage) {
          statusMessage.innerHTML = "Using demo data. To see live data, make sure the Google Sheet is set to 'Anyone with the link can view'.";
        }
        renderLeaderboard(MOCK_DATA);
      }
    });
  } catch (err) {
    console.error("Error initiating Papa Parse:", err);
    renderLeaderboard(MOCK_DATA);
  }
}

// Start loading
loadData();
