"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $episodesList = $('#episodes-list');
const $searchForm = $("#search-form");

const MISSING_IMAGE_URL = "http://tinyurl.com/missing-tv";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const response = await axios.get('https://api.tvmaze.com/search/shows', { params: { q: term } });

  return response.data.map((element) => {
    const show = element.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary || "",
      image: show.image ? show.image.medium : MISSING_IMAGE_URL
    }
  });
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-6 col-lg-3 mb-4">
         <div class="media card h-100">
           <img 
              src="${show.image}" 
              alt="${show.name}" 
              class="card-img-top">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm btn-primary Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

$('#shows-list').on("click", '.Show-getEpisodes', async function (evt) {
  const id = $(evt.target).closest('.Show').data('show-id');
  const episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  return response.data.map(episode => {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    }
  });
}

/** Given an array of episodes, add an LI with the name and season/episode number to episodes list */

function populateEpisodes(episodes) { 
  $episodesList.empty();

  for (let episode of episodes) {
    $("<li>", {text: `${episode.name} (season ${episode.season}, number ${episode.number})`}).appendTo($episodesList);
  }

  $episodesArea.show();
}
