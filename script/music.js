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

// Get API to count em
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
    console.error("Could not get Web-api info", err);
  }
}
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
    console.error('Could not get data:', err);
    alert(`Failed to received data from server: ${err.message}`);
  }
}

// Render list
function renderResults() {
  resultsContainer.innerHTML = allResults.map(item => `
    <div class="music-group-card">
      <span>${item.name}</span>
      <button class="btn btn-outline-light btn-sm" onclick="showDetails('${item.musicGroupId}')">Details</button>
    </div>
  `).join('');

}

// modal detail
window.showDetails = async function (id) {
  const group = await service.readMusicGroupAsync(id, false);

  const modalTitle = document.getElementById('musicModalLabel');
  const modalBody = document.getElementById('musicModalBody');
  modalTitle.innerText = group.name;

  // ARTISTS
  let artistsHtml = '<li>No Artists</li>';
  if (group.artists?.length) {
    const artistDetails = await Promise.all(
      group.artists.map(a => service.readArtistAsync(a.artistId, true))
    );
    artistsHtml = artistDetails.map(a => {
      const groups = a.musicGroups?.length
        ? a.musicGroups.map(g => g.name).join(', ')
        : '';
      return `<li>${a.firstName} ${a.lastName}${groups ? ` – <em>${groups}</em>` : ''}</li>`;
    }).join('');
  }

  // ALBUMS
  let albumHtml = '<li>No Albums</li>';
  try {
    const albumResult = await service.readAlbumsAsync(0, true, null, 1000); // stor batch

    const matchingAlbums = albumResult.pageItems.filter(a =>
      a.musicGroup?.musicGroupId === group.musicGroupId
    );

    if (matchingAlbums.length) {
      albumHtml = matchingAlbums.map(a => `
        <li><strong>${a.name}</strong> (${a.releaseYear || '?'})</li>
      `).join('');
    } else {
      albumHtml = '<li>No matching albums (likely due to missing link to music group in the data)</li>';
    }
  } catch (err) {
    console.error("Error while trying to get albums:", err);
  }

  modalBody.innerHTML = `
    <p><strong>Genre:</strong> ${group.strGenre || 'okänd'}</p>
    <p><strong>Established:</strong> ${group.establishedYear || 'okänt'}</p>
    <p><strong>Artists:</strong></p>
    <ul>${artistsHtml}</ul>
    <p><strong>Albums:</strong></p>
    <ul>${albumHtml}</ul>
  `;

  const modal = new bootstrap.Modal(document.getElementById('musicModal'));
  modal.show();
};


function updatePageInfo() {
  const pageInfo = document.getElementById('pageInfo');
  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }
}

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

searchForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();

  currentQuery = query || null;
  currentPage = 1;

  try {
    await fetchMusicGroups(currentPage);
  } catch (err) {
    console.error('Search failed:', err);
    alert('Could not load search results.');
  }
});