'use strict';

const apiUrl = 'https://seido-webservice-307d89e1f16a.azurewebsites.net/api/music';
let allResults = [];
let currentPage = 1;
const resultsPerPage = 10;

const mainContainer = document.querySelector('.GridItemMain.homeMain');

// Skapa container för resultat
const resultsContainer = document.createElement('div');
resultsContainer.id = 'results';
resultsContainer.className = 'container mt-4';
mainContainer.appendChild(resultsContainer);

// Skapa navigation
const navContainer = document.createElement('div');
navContainer.id = 'pagination';
navContainer.className = 'd-flex justify-content-center mb-4';
navContainer.innerHTML = `
  <button id="prevBtn" class="btn btn-secondary m-2">Previous</button>
  <button id="nextBtn" class="btn btn-secondary m-2">Next</button>
`;
mainContainer.appendChild(navContainer);

document.getElementById('prevBtn')?.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderResults();
  }
});

document.getElementById('nextBtn')?.addEventListener('click', () => {
  if (currentPage * resultsPerPage < allResults.length) {
    currentPage++;
    renderResults();
  }
});

async function fetchMusicData() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Network response was not ok');
    let data = await response.json();
    console.log('Fetched data:', data);

    allResults = data.sort((a, b) => a.artist.localeCompare(b.artist));
    renderResults();
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

function renderResults() {
  const start = (currentPage - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  const currentResults = allResults.slice(start, end);

  resultsContainer.innerHTML = currentResults.map(item => `
    <div class="card p-3 mb-3 shadow">
      <h5 class="mb-1">${item.artist}</h5>
      <p class="mb-0">${item.title}</p>
    </div>
  `).join('');
}

fetchMusicData();
