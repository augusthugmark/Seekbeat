'use strict';

import musicService from './music-group-f-service.js';

const service = new musicService('https://seido-webservice-307d89e1f16a.azurewebsites.net/api');

let allResults = [];
let currentPage = 1;
const resultsPerPage = 10;
let totalPages = 0;
let currentQuery = null;

const resultsContainer = document.querySelector('#musicResultsArea');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchResultInfo = document.getElementById('searchResultInfo');

loadApiInfo();
fetchMusicGroups(currentPage);

// Hämta API-info för räknare
async function loadApiInfo() {
  try {
    const info = await service.readInfoAsync();

    document.getElementById('count-groups').innerText =
      `Music groups: ${info.db.nrSeededMusicGroups + info.db.nrUnseededMusicGroups}`;

    document.getElementById('count-albums').innerText =
      `Albums: ${info.db.nrSeededAlbums + info.db.nrUnseededAlbums}`;

    document.getElementById('count-artists').innerText =
      `Artists: ${info.db.nrSeededArtists + info.db.nrUnseededArtists}`;
  } catch (err) {
    console.error("Kunde inte hämta WebAPI-info:", err);
  }
}

// Hämta grupper per sida
async function fetchMusicGroups(page) {
  try {
    const result = await service.readMusicGroupsAsync(
      page - 1,
      true,
      currentQuery,
      resultsPerPage
    );

    allResults = result.pageItems;
    totalPages = result.pageCount;
    currentPage = page;

    renderResults();
    updatePageInfo();

    if (currentQuery) {
    searchResultInfo.innerText = `${result.dbItemsCount} results found for "${currentQuery}"`;
    } else {
      searchResultInfo.innerText = '';
    }
  } catch (err) {
    console.error('Kunde inte hämta data:', err);
    alert(`Failed to received data from server: ${err.message}`);
  }
}

// Rendera listan
function renderResults() {
  resultsContainer.innerHTML = allResults.map(item => `
    <div class="list-group-item bg-transparent text-light border-0 d-flex justify-content-between align-items-center">
      <span class="fs-5">${item.name}</span>
      <button class="btn btn-outline-light btn-sm" onclick="showDetails('${item.musicGroupId}')">Details</button>
    </div>
  `).join('');
}

// Visa detaljerad info i modal
window.showDetails = async function (id) {
  const group = await service.readMusicGroupAsync(id, true);

  const modalTitle = document.getElementById('musicModalLabel');
  const modalBody = document.getElementById('musicModalBody');
  modalTitle.innerText = group.name;

  // ARTISTER
  let artistsHtml = '<li>Inga artister</li>';
  if (group.artists?.length) {
    const artistDetails = await Promise.all(
      group.artists.map(a => service.readArtistAsync(a.artistId, true))
    );
    artistsHtml = artistDetails.map(a => {
      const groups = a.musicGroups?.map(g => g.name).join(', ') || 'Inga grupper';
      return `<li>${a.firstName} ${a.lastName} – <em>${groups}</em></li>`;
    }).join('');
  }

  // ALBUM
  let albumHtml = '<li>Inga album</li>';
  if (group.albums?.length) {
    const albumDetails = await Promise.all(
      group.albums.map(a => service.readAlbumAsync(a.albumId, true))
    );
    albumHtml = albumDetails.map(a => {
      const artistNames = a.artists?.map(art => `${art.firstName} ${art.lastName}`).join(', ') || 'Inga artister';
      return `<li>
        <strong>${a.name}</strong> (${a.releaseYear || '?'})<br/>
        <em>Artists:</em> ${artistNames}<br/>
        <em>Group:</em> ${a.musicGroup?.name || 'Okänd grupp'}
      </li>`;
    }).join('');
    }

  modalBody.innerHTML = `
    <p><strong>Genre:</strong> ${group.strGenre || 'okänd'}</p>
    <p><strong>Grundat:</strong> ${group.establishedYear || 'okänt'}</p>
    <p><strong>Artister:</strong></p>
    <ul>${artistsHtml}</ul>
    <p><strong>Album:</strong></p>
    <ul>${albumHtml}</ul>
  `;

  const modal = new bootstrap.Modal(document.getElementById('musicModal'));
  modal.show();
};

// Uppdatera sidinfo
function updatePageInfo() {
  const pageInfo = document.getElementById('pageInfo');
  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }
}

// SIDKNAPPAR
document.getElementById('firstBtn')?.addEventListener('click', () => {
  if (currentPage !== 1) {
    currentPage = 1;
    fetchMusicGroups(currentPage);
  }
});

document.getElementById('lastBtn')?.addEventListener('click', () => {
  if (currentPage !== totalPages) {
    currentPage = totalPages;
    fetchMusicGroups(currentPage);
  }
});

document.getElementById('prevBtn')?.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchMusicGroups(currentPage);
  }
});

document.getElementById('nextBtn')?.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchMusicGroups(currentPage);
  }
});

// Sökfunktion
searchForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();

  currentQuery = query || null;
  currentPage = 1;

  try {
    await fetchMusicGroups(currentPage);
  } catch (err) {
    console.error('Sökningen misslyckades:', err);
    alert('Kunde inte hämta sökresultat.');
  }
});