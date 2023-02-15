function checkMangaLicensed(mangaName) {
  const searchOptions = {
    method: 'POST',
    url: 'https://api.mangaupdates.com/v1/series/search',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'bearerAuth' /*if you got any authorization key from the mangaupdate API put it here*/
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
        let bestMatchIndex;
        let highestScore = 0;
        searchBody.results.forEach((result, index) => {
          const title = result.hit_title.toLowerCase();
          const score = calculateScore(title, mangaName.toLowerCase());
          if (score > highestScore) {
            highestScore = score;
            bestMatchIndex = index;
          }
        });
        let series_id = searchBody.results[bestMatchIndex].record.series_id;
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


function calculateScore(str1, str2) {
  let score = 0;
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] === str2[i]) {
      score++;
    }
  }
  if (str1.includes("(novel)")) {
    score -= 500;
  }
  if (str2.includes("(novel)")) {
    score -= 500;
  }
  if (str1.length > str2.length) {
    score -= (str1.length - str2.length);
  } else if (str2.length > str1.length) {
    score -= (str2.length - str1.length);
  }
  if (score < 0) {
    score = 0;
  }
  return score;
}

let manga;
let isLicensed;
const label = document.createElement('span');
label.classList.add('licensed-label');

document.addEventListener("DOMContentLoaded", async function() {
  let checkManga = setInterval(async function() {
    manga = document.querySelector('div.title > p');
    if (manga) {
      clearInterval(checkManga);
      const isLicensed = await checkMangaLicensed(manga.innerText);
      label.innerText = isLicensed ? ',Licensed in english' : ',Not Licensed in english';
      document.querySelector('span.tag.dot.no-wrapper').appendChild(label);
    }
  }, 100);
});

document.dispatchEvent(new Event('DOMContentLoaded'));
