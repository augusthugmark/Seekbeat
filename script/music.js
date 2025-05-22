'use strict';

import musicService from './music-group-service.js';

const service = new musicService("https://seido-webservice-307d89e1f16a.azurewebsites.net/api");

let allResults = [];
let currentPage = 1;
const resultsPerPage = 10;

const mainContainer = document.querySelector('#musicResultsArea');

// Skapa container för resultat
const resultsContainer = document.createElement('div');
resultsContainer.id = 'results';
resultsContainer.className = 'container mt-4';
mainContainer.appendChild(resultsContainer);

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

// Form search hantering
const searchForm = document.querySelector("form");
searchForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const query = document.getElementById("searchInput").value.trim();
  console.log("Search for:", query);
  // Här kan du lägga till filtrering eller sökfunktionalitet senare
});

async function fetchMusicData() {
  try {
    // 1. Hämta första sidan och visa direkt
    const firstPage = await service.readMusicGroupsAsync(1, true, null, 1000);
    allResults = [...firstPage.pageItems];
    renderResults();
    updatePageInfo();

    // 2. Ladda resterande sidor i bakgrunden
    const totalPages = firstPage.pageCount;
    for (let page = 2; page <= totalPages; page++) {
      const result = await service.readMusicGroupsAsync(page, true, null, 1000);
      allResults.push(...result.pageItems);
      console.log(`Fetched page ${page} of ${totalPages}`);
    }

    // 3. Sortera när allt är klart
    allResults.sort((a, b) => a.name.localeCompare(b.name));
    renderResults(); // uppdatera med sorterad data
    updatePageInfo();

  } catch (error) {
    console.error("Error:", error);
  }
}

function renderResults() {
  const start = (currentPage - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  const currentResults = allResults.slice(start, end);

  console.log("Current page items:", currentResults);

  resultsContainer.innerHTML = currentResults.map(item => `
  <div class="card p-3 mb-3 shadow" style="background-color: white; color: black;">
    <h5 class="mb-1" style="color: black;">${item.name}</h5>
    <p class="mb-0" style="color: black;">Established: ${item.establishedYear || 'Unknown established year'}</p>
  </div>
`).join('');

  // Visa sidnummer
  const pageInfo = document.getElementById("pageInfo");
  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(allResults.length / resultsPerPage)}`;
  }
}

function renderFilteredResults(filteredList) {
  const start = (currentPage - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  const currentResults = filteredList.slice(start, end);

  resultsContainer.innerHTML = currentResults.map(item => `
    <div class="card p-3 mb-3 shadow">
      <h5 class="mb-1">${item.name}</h5>
      <p class="mb-0">${item.establishedYear ? `Established: ${item.establishedYear}` : 'Established: Unknown'}</p>
    </div>
  `).join('');

  document.getElementById('pageIndicator').textContent =
    `Sida ${currentPage} av ${Math.ceil(filteredList.length / resultsPerPage)}`;
}

fetchMusicData();

document.querySelector('form').addEventListener('submit', e => {
  e.preventDefault();
  const searchTerm = document.querySelector('input[type="search"]').value.toLowerCase();
  const filtered = allResults.filter(item =>
    item.name.toLowerCase().includes(searchTerm)
  );
  currentPage = 1;
  renderFilteredResults(filtered);
});