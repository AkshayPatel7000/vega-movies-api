const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const agent = new https.Agent({
  rejectUnauthorized: false,
});
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

    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      },
    });

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

  async search(query, page) {
    const searchResults = [];
    let data = JSON.stringify({
      memory: {
        totalJSHeapSize: 34226004,
        usedJSHeapSize: 18218240,
        jsHeapSizeLimit: 4294705152,
      },
      resources: [],
      referrer: 'https://vegamovies.ms/?s=sa',
      eventType: 1,
      firstPaint: 1684,
      firstContentfulPaint: 1684,
      startTime: 1736582028873,
      versions: {
        fl: '2024.10.5',
        js: '2024.6.1',
        timings: 2,
      },
      pageloadId: '4817a8d6-1ac0-428e-aad2-26f13e2e99eb',
      location: 'https://vegamovies.ms/',
      nt: 'navigate',
      serverTimings: [
        {
          name: 'cfCacheStatus',
          dur: 0,
          desc: 'EXPIRED',
        },
        {
          name: 'cfL4',
          dur: 0,
          desc: '?proto=QUIC&rtt=78569&min_rtt=64735&rtt_var=14856&sent=3245&recv=552&lost=191&retrans=185&sent_bytes=3679574&recv_bytes=101289&delivery_rate=333&cwnd=10376&unsent_bytes=0&cid=1854ceedf97a0db9&ts=42384&x=1',
        },
        {
          name: 'cfExtPri',
          dur: 0,
          desc: '',
        },
      ],
      timingsV2: {
        unloadEventStart: 932.7999999999884,
        unloadEventEnd: 932.7999999999884,
        domInteractive: 1815.7999999999884,
        domContentLoadedEventStart: 1818.7999999999884,
        domContentLoadedEventEnd: 1818.9000000000233,
        domComplete: 7856.600000000035,
        loadEventStart: 7856.600000000035,
        loadEventEnd: 7857.100000000035,
        type: 'navigate',
        redirectCount: 0,
        criticalCHRestart: 0,
        activationStart: 0,
        initiatorType: 'navigation',
        nextHopProtocol: 'h3',
        deliveryType: '',
        workerStart: 0,
        redirectStart: 0,
        redirectEnd: 0,
        fetchStart: 1.7999999999883585,
        domainLookupStart: 1.7999999999883585,
        domainLookupEnd: 1.7999999999883585,
        connectStart: 1.7999999999883585,
        connectEnd: 1.7999999999883585,
        secureConnectionStart: 1.7999999999883585,
        requestStart: 3.5,
        responseStart: 925.6000000000349,
        responseEnd: 1003.5,
        transferSize: 19545,
        encodedBodySize: 19245,
        decodedBodySize: 109166,
        responseStatus: 200,
        firstInterimResponseStart: 0,
        renderBlockingStatus: 'non-blocking',
        name: 'https://vegamovies.ms/?s=body',
        entryType: 'navigation',
        startTime: 0,
        duration: 7857.100000000035,
      },
      dt: '',
      siteToken: '9ae8f2108c76481292bb717e3fd22cd8',
      st: 2,
    });

    // for (let i = 1; i <= 7; i++) {
    const response = await axios.post(
      `${this.mainUrl}/page/${page ? page : 1}?s=${query}`,
      data,
      {
        headers: {
          'Content-Type': 'application/json, application/json',
          'accept-language': 'en-IN,en;q=0.9,hi;q=0.8',
          cookie:
            '_ga=GA1.1.810454377.1735978683; cf_clearance=Kf0U6NI618J7XKQADeMuGZsHvjTXIFtdpWuit0HYcWg-1736581989-1.2.1.1-PZDMb8GzjTs8vGmO8lhtWe0OPuGXCmhiNjqGFfUDWWNxMzWk5ETkH_QJKipx6dybXvZrwcjP7V433wkeDB6iseRtgu_bEzXaK9s42MoR3Bj6YEaTaC4xe71WalaBJlR6rT7thqiyoWAuI8g.zd7jwgRqYP7sQlDFRBxpAPGKN7BmrEwEobjNdgsTN1JS4COMjTiIPvt9VioNAkAGCfvgHf9bvZ6xtZlgk_Ws7dsq8_t_LE91Uib6Wzd9JbKGqh3VV3Esb2pmaWt7Cbju2DLOZH1JTRFji5gzeAgvehD0EtTLrSjBpvZ0eF768duXxFTxXQMJxPA5sJfoQjSNZo5Ude5qV6R6eJbEQFbzATpqQlGPC8DLZ912Kay93nOUhmbN; _ga_BLZGKYN5PF=GS1.1.1736581989.4.1.1736582005.0.0.0',
          priority: 'u=0, i',
          referer: 'https://vegamovies.ms/?s=sa',
          'sec-ch-ua':
            '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Linux"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-user': '?1',
          'upgrade-insecure-requests': '1',
          Referer: 'https://vegamovies.ms/',
          origin: 'https://vegamovies.ms',
          'if-modified-since': 'Tue, 06 Aug 2024 09:42:44 GMT',
          'if-none-match': 'W/"f26-61f009d914136"',
          Origin: 'https://vegamovies.ms',
          'content-type': 'application/json',
          'If-None-Match': '"3f23NR77teahEe4vUJTQ+cmF36I="',
          'If-Modified-Since': 'Sat, 04 Jan 2025 07:00:23 GMT',
        },
      }
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
  async getTheSourceUrl(source, p) {
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
        res: this.extractResolution(title),
      };
    } catch (error) {
      console.error(`Error fetching URL source ${source}: ${error.message}`);
    }
  }
  extractResolution(fileName) {
    const match = fileName.match(/\b(480p|720p|1080p|2160p)\b/); // Match common resolutions
    return match ? match[0] : null; // Return the resolution if found, otherwise null
  }

  async getEpisodeLinks(buttons, p) {
    const episodeLinks = [];

    for (const button of buttons) {
      const link = button?.vCloudLink || '';

      if (link) {
        try {
          // Make the HTTP request to get the page content
          const response = await axios(link);
          const doc = cheerio.load(response.data);
          const dataUrl = doc('a[href*="https://vcloud"]');
          for (let i = 0; i < dataUrl?.length; i++) {
            console.log(`Iteration: ${i + 1}, `, dataUrl[i]?.attribs?.href);

            if (dataUrl[i]?.attribs?.href) {
              const d = await this.getTheSourceUrl(dataUrl[i]?.attribs?.href);
              episodeLinks.push(d);
            }
          }
          // Find the source link with "https://vcloud" in the href attribute
          // const source = doc('a[href*="https://vcloud"]') || [];
          // if (source?.length > 0) {
          //   const d = await this.getTheSourceUrl(source, p);
          //   episodeLinks.push(d);
          // }
        } catch (error) {
          console.error(`Error fetching URL ${link}: ${error.message}`);
        }
      }
      if (p === button?.res) {
        break;
      }
    }

    return episodeLinks; // Return the result after all async operations are complete
  }
  async load(url, p) {
    let data =
      'action=ha_inject_pro_related&withNonce=false&related_post_id=51030&free_related_posts_opt=categories&layout_class=col-2cl&HuFrontNonce=1a6309bad9';
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json, application/json',
        'accept-language': 'en-IN,en;q=0.9,hi;q=0.8',
        cookie:
          '_ga=GA1.1.810454377.1735978683; _ga_BLZGKYN5PF=GS1.1.1736581989.4.1.1736585543.0.0.0; cf_clearance=_c3_BUXU9ONWeL0UP7kJtITfPEJ89emvKcJGofjzZ08-1736585548-1.2.1.1-0kTVgHLzK67dXkfwP1HX3P5yyEgI9ffkpTszEx4JJIHKueFb4.8OP.TNTq5nAOzwxLCUpwXTTbSFozlO2OPl18d.nH0FKc2uS8n8bM5Ol2_T7UcCks246cBltUdfXcB7ziDPmh2G8n56NLb2rh8V86VVc0_CXi_Y78UCSWSNJJEqM6XjIEu5KtA.dUNoMLvxIDU.wYUQM_O5_t5hA0xObQMc3oROU44DjOYtoZAiuAHda6c0dzMOkmBBjTBzi.xPvGWw5asStaKjVCN3dpT5CvspQaFwqXW_ah32R4nNXyoJTEzDv_rjj.oc8BSSeuIKLztNy4FUXXxauV.v1EpmnZn29sDscluvG6SvXZpNzec89Fd9S6_vxBGepmrNMKvx',
        priority: 'u=0, i',
        'sec-ch-ua':
          '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        Referer: 'https://vegamovies.ms/',
        referer:
          'https://vegamovies.ms/51030-download-superman-3-1983-english-480p-720p.html',
        origin: 'https://vegamovies.ms',
        'if-modified-since': 'Tue, 06 Aug 2024 09:42:44 GMT',
        'if-none-match': 'W/"f26-61f009d914136"',
        Origin: 'https://vegamovies.ms',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest',
      },
    });
    const $ = cheerio.load(response.data);

    let title = $('meta[property=og:title]')
      .attr('content')
      .replace('Download ', '');
    let posterUrl = $('meta[property=og:image]').attr('content');
    let description = $('div').find("h3:contains('SYNOPSIS')").text();

    const imdbUrl = $('a:contains("Rating")').attr('href');

    const imdbId = imdbUrl ? imdbUrl.split('title/')[1].split('/')[0] : null;

    const tvType = description.includes('Series') ? 'series' : 'movie';
    console.log(
      '🚀 ~ file: index.js:322 ~ VegaMoviesProvider ~ load ~ imdbId:',
      imdbId,
      tvType
    );

    const jsonResponse =
      imdbId &&
      (await axios.get(`${this.cinemetaUrl}/${tvType}/${imdbId}.json`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        },
      }));
    const responseData = jsonResponse?.data || {};

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

    const combinedTextsArray = $('*[style="text-align: center;"] strong span')
      .not('span span') // Exclude nested <span> elements inside other <span>
      .map(function () {
        return $(this).text().trim(); // Extract and trim text from each <span>
      })
      .get();

    // Find all <a> tags with buttons containing "V-Cloud"
    const vCloudLinks = [];

    $('p > a:has(button)').each(function () {
      const buttonText = $(this).find('button').text().trim();
      if (
        buttonText.includes('Download Now') ||
        buttonText.includes('V-Cloud') ||
        buttonText.includes('Batch/Zip')
      ) {
        vCloudLinks.push($(this).attr('href'));
      }
    });
    console.log(
      '🚀 ~ file: index.js:371 ~ VegaMoviesProvider ~ load ~ vCloudLinks:',
      vCloudLinks,
      combinedTextsArray
    );

    const result = vCloudLinks?.map((link, index) => ({
      vCloudLink: link,
      title: combinedTextsArray[index],
      source: link,
      res: this.extractResolution(combinedTextsArray[index] || ''),
      strongText: combinedTextsArray[index] || null,
      url: [], // Handle cases where one array is longer
    }));
    if (p) {
      const buttonsSelected = result.filter((e) => e?.res === p);

      await this.getEpisodeLinks(buttonsSelected, p)
        .then((episodeLinks1) => {
          episodeLinks = episodeLinks1; // Outputs the array of episode links with 'source'
        })
        .catch((err) => {
          console.error('Error fetching episode links:', err);
        });
    } else {
      episodeLinks = result;
    }

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
