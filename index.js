const axios = require('axios');
const cheerio = require('cheerio');

class VegaMoviesProvider {
  constructor() {
    this.mainUrl = 'https://vegamovies.ms';
    this.name = 'VegaMovies';
    this.lang = 'hi';
    this.cinemetaUrl = 'https://v3-cinemeta.strem.io/meta';
    this.supportedTypes = ['Movie', 'TvSeries', 'AsianDrama', 'Anime'];
  }

  async getMainPage(page, type, query) {
    const url =
      type?.trim() === ''
        ? `${this.mainUrl}/page/${page}`
        : `${this.mainUrl}/${type}/page/${page}`;

    const response = await axios.get(url);

    const $ = cheerio.load(response.data);

    const home = [];
    $('.post-inner').each((i, element) => {
      const searchResult = this.toSearchResult($(element));
      if (searchResult) {
        home.push(searchResult);
      }
    });

    return home;
  }
  getTitle(fileName) {
    const nameWithoutExtension = fileName?.split('.')?.slice(0, -1)?.join('.');

    // Replace hyphen with space
    return nameWithoutExtension?.replaceAll('-', ' ');
  }
  toSearchResult(element) {
    const href = element.find('a').attr('href');
    const time = element.find('time').text();

    let posterUrl =
      element.find('img').attr('data-src') || element.find('img').attr('src');

    const string = element.find('a').text();
    const title = string.replace(/[\n\t]|ArthurDownload/g, '').trim() || '';

    return {
      title,
      href,
      type: 'Movie', // assuming the type is Movie for now
      posterUrl,
      time,
    };
  }

  async search(query) {
    const searchResults = [];

    // for (let i = 1; i <= 7; i++) {
    const response = await axios.get(`${this.mainUrl}/?s=${query}`);
    console.log(
      '🚀 ~ file: index.js:67 ~ VegaMoviesProvider ~ search ~ response:',
      response
    );
    const $ = cheerio.load(response.data);

    const results = [];
    $('.post-inner').each((i, element) => {
      const searchResult = this.toSearchResult($(element));
      if (searchResult) {
        results.push(searchResult);
      }
    });

    //   if (results.length === 0) {
    //     break;
    //   }
    searchResults.push(...results);
    // }

    return searchResults;
  }
  async getTheSourceUrl(source) {
    try {
      const sourceResponse = await axios(source);
      const sourceDoc = cheerio.load(sourceResponse.data);
      const title = sourceDoc('title').text() || '';

      // If you are sure the script has a specific type, try selecting without the type
      const scriptWithUrl = sourceDoc('script[type="text/javascript"]').text(); // This gets the text of the inline JavaScript

      var urlMatch = scriptWithUrl.match(/var\s+url\s*=\s*['"]([^'"]+)['"]/);
      const finalUrl = await axios(urlMatch[1]);
      const finalDoc = cheerio.load(finalUrl.data);
      const finalUrls = finalDoc('a.btn.btn-success.btn-lg.h6');
      let sources = [];

      for (const button of finalUrls) {
        const href = button.attribs?.href;

        sources.push({
          url: href,
          title: finalDoc(button)?.text()?.trim() || '',
        });
      }

      return {
        source: urlMatch[1] || '',
        title,
        url: sources,
      };
    } catch (error) {
      console.error(`Error fetching URL source ${source}: ${error.message}`);
    }
  }
  async getEpisodeLinks(buttons) {
    const episodeLinks = [];

    for (const button of buttons) {
      const link = button?.attribs.href || '';

      if (link) {
        try {
          // Make the HTTP request to get the page content
          const response = await axios(link);
          const doc = cheerio.load(response.data);

          // Find the source link with "https://vcloud" in the href attribute
          const source =
            doc('a[href*="https://vcloud"]')[0]?.attribs?.href || '';

          if (source) {
            const d = await this.getTheSourceUrl(source);
            episodeLinks.push(d);
          }
        } catch (error) {
          console.error(`Error fetching URL ${link}: ${error.message}`);
        }
      }
    }

    return episodeLinks; // Return the result after all async operations are complete
  }
  async load(url) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    let title = $('meta[property=og:title]')
      .attr('content')
      .replace('Download ', '');
    let posterUrl = $('meta[property=og:image]').attr('content');
    let description = $('div.entry-content')
      .find("h3:contains('SYNOPSIS') + p")
      .text();
    const imdbUrl = $('a:contains("Rating")').attr('href');

    const imdbId = imdbUrl ? imdbUrl.split('title/')[1].split('/')[0] : null;
    const tvType = description.includes('Series') ? 'series' : 'movie';

    const jsonResponse = await axios.get(
      `${this.cinemetaUrl}/${tvType}/${imdbId}.json`
    );
    const responseData = jsonResponse.data;

    let cast = [];
    let genre = [];
    let imdbRating = '';
    let year = '';
    let background = posterUrl;

    if (responseData && responseData.meta) {
      cast = responseData.meta.cast || [];
      genre = responseData.meta.genre || [];
      imdbRating = responseData.meta.imdbRating || '';
      year = responseData.meta.year || '';
      background = responseData.meta.background || background;
      title = responseData.meta.name || title;
      description = responseData.meta.description || description;
      posterUrl = responseData.meta.poster || posterUrl;
    }

    let episodeLinks = [];

    const buttons = $('p > a:has(button)');

    await this.getEpisodeLinks(buttons)
      .then((episodeLinks1) => {
        episodeLinks = episodeLinks1; // Outputs the array of episode links with 'source'
      })
      .catch((err) => {
        console.error('Error fetching episode links:', err);
      });

    return {
      title,
      url,
      type: tvType,
      episodeLinks,
      posterUrl,
      description,
      genre,
      imdbRating,
      year,
      background,
      cast,
    };
  }
}
module.exports = VegaMoviesProvider;
