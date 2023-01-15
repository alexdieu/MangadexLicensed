
function checkMangaLicensed(mangaName) {
  const searchOptions = {
    method: 'POST',
    url: 'https://api.mangaupdates.com/v1/series/search',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'bearerAuth'
    },
    body: {
      search: mangaName,
      stype: 'title'
    },
    json: true
  };
  return fetch(searchOptions.url, {
    method: searchOptions.method,
    headers: searchOptions.headers,
    body: JSON.stringify(searchOptions.body)
  }).then(searchResponse => {
    return searchResponse.json().then(searchBody => {
      if (searchBody.results.length > 0) {
        let series_id = searchBody.results[0].record.series_id;
        const seriesOptions = {
          method: 'GET',
          url: `https://api.mangaupdates.com/v1/series/${series_id}`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearerAuth'
          },
          json: true
        };
        return fetch(seriesOptions.url, {
          method: seriesOptions.method,
          headers: seriesOptions.headers
        }).then(seriesResponse => {
          return seriesResponse.json().then(seriesBody => {
            let licensed = seriesBody.licensed;
            return licensed;
          });
        });
      } else {
        alert(`No series found with the name ${mangaName}`);
        return null;
      }
    });
  });
}



document.addEventListener("DOMContentLoaded", async function() {
  let mangaCards = document.getElementsByClassName('manga-card');
  while (mangaCards.length === 0){
    await new Promise(resolve => setTimeout(resolve, 100));
    mangaCards = document.getElementsByClassName('manga-card');
  }
  for (let card of mangaCards) {
    const title = card.querySelector('a.title span').textContent;
    const isLicensed = await checkMangaLicensed(title);
    const label = document.createElement('div');
    label.classList.add('licensed-label');
    label.innerText = isLicensed ? 'Licensed in english' : 'Not Licensed in english';
    card.appendChild(label);
  }
});
document.dispatchEvent(new Event('DOMContentLoaded'));
