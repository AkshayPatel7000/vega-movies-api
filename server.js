const express = require('express');
const bodyParser = require('body-parser');
const VegaMoviesProvider = require('./index'); // Assuming you have the class in VegaMoviesProvider.js

const app = express();
const port = process.env.PORT || 4001;
app.set('view engine', 'ejs');
app.set('views', './views');
// Instantiate the VegaMoviesProvider class
const provider = new VegaMoviesProvider();

// Middleware to parse incoming requests with JSON payloads
app.use(bodyParser.json());
// Route to get the main page with movies
app.get('/', async (req, res) => {
  try {
    console.log(res);
    res.json({ status: true, message: 'Lets start' }); // Send the main page results
  } catch (error) {
    console.error('Error getting main page:', error);
    res.status(500).json({ error: 'Failed to fetch main page data', error });
  }
});

// Route to get the main page with movies
app.get('/movies/main', async (req, res) => {
  const { page = 1, type = '', query = '' } = req.query;
  const currentUrl = req.protocol + '://' + req.get('x-forwarded-host');
  try {
    const mainPageResults = await provider.getMainPage(page, type, query);
    res.render('main', { movies: mainPageResults, currentUrl });
    // res.json(mainPageResults); // Send the main page results
  } catch (error) {
    console.error('Error getting main page:', error);
    res.status(500).json({ error: 'Failed to fetch main page data', error });
  }
});

// Route to search movies by query
app.get('/movies/search', async (req, res) => {
  const { query, page } = req.query;
  const currentUrl = req.protocol + '://' + req.get('x-forwarded-host');

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const searchResults = await provider.search(query, page);
    // res.json(searchResults); // Send search results
    res.render('main', { movies: searchResults, currentUrl });
  } catch (error) {
    console.error('Error searching for movies:', error);
    res.status(500).json({ error: 'Failed to search for movies', error });
  }
});

// Route to get detailed information about a movie or TV series
app.get('/movies/load', async (req, res) => {
  const { url, p } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  const currentUrl =
    req.protocol + '://' + req.get('x-forwarded-host') + req.originalUrl;
  const streamUrl = req.protocol + '://' + req.get('x-forwarded-host');
  try {
    const movieDetails = await provider.load(url, p);
    // res.json(movieDetails); // Send movie details
    res.render('movie-details', { movie: movieDetails, currentUrl, streamUrl });
  } catch (error) {
    console.error('Error loading movie details:', error);
    res.status(500).json({ error: 'Failed to load movie details', error });
  }
});
app.get('/stream', async (req, res) => {
  const { url } = req.query;
  const currentUrl = req.protocol + '://' + req.get('x-forwarded-host');

  try {
    res.render('player', { movie: { title: '' }, videoUrl: url, currentUrl });
  } catch (error) {
    console.error('Error getting main page:', error);
    res.status(500).json({ error: 'Failed to fetch main page data', error });
  }
});
// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
