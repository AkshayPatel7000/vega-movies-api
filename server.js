const express = require('express');
const bodyParser = require('body-parser');
const VegaMoviesProvider = require('./index'); // Assuming you have the class in VegaMoviesProvider.js

const app = express();
const port = process.env.PORT || 4000;

// Instantiate the VegaMoviesProvider class
const provider = new VegaMoviesProvider();

// Middleware to parse incoming requests with JSON payloads
app.use(bodyParser.json());
// Route to get the main page with movies
app.get('/', async (req, res) => {
  try {
    res.json({ status: true, message: 'Lets start' }); // Send the main page results
  } catch (error) {
    console.error('Error getting main page:', error);
    res.status(500).json({ error: 'Failed to fetch main page data', error });
  }
});

// Route to get the main page with movies
app.get('/movies/main', async (req, res) => {
  const { page = 1, type = '', query = '' } = req.query;

  try {
    const mainPageResults = await provider.getMainPage(page, type, query);
    res.json(mainPageResults); // Send the main page results
  } catch (error) {
    console.error('Error getting main page:', error);
    res.status(500).json({ error: 'Failed to fetch main page data', error });
  }
});

// Route to search movies by query
app.get('/movies/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const searchResults = await provider.search(query);
    res.json(searchResults); // Send search results
  } catch (error) {
    console.error('Error searching for movies:', error);
    res.status(500).json({ error: 'Failed to search for movies', error });
  }
});

// Route to get detailed information about a movie or TV series
app.get('/movies/load', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const movieDetails = await provider.load(url);
    res.json(movieDetails); // Send movie details
  } catch (error) {
    console.error('Error loading movie details:', error);
    res.status(500).json({ error: 'Failed to load movie details', error });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
