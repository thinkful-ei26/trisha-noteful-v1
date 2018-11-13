'use strict';

const express = require('express');

const {PORT} = require('./config');

const {logger} = require('./middleware/logger');

// Load array of notes
const data = require('./db/notes');
const simDB = require('./db/simDB');
const notes = simDB.initialize(data);

// Create an Express application
const app = express();

// Create a static webserver
app.use(express.static('public'));

// Parse request body
app.use(express.json());

app.use(logger);

// Get All (and search by query)
app.get('/api/notes', (req, res, next) => {

  const { searchTerm } = req.query;

  notes.filter(searchTerm, (err, list) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(list); // responds with filtered array
  });
  // Basic JSON response (data is an array of objects)
  // res.json(data);

  /**
   * Implement Search
   * Below are 2 solutions: verbose and terse. They are functionally identical but use different syntax
   *
   * Destructure the query string property in to `searchTerm` constant
   * If searchTerm exists...
   * then `filter` the data array where title `includes` the searchTerm value
   * otherwise return `data` unfiltered
   */

  /**
   * Verbose solution
   */
  //   const searchTerm = req.query.searchTerm;
  //   if (searchTerm) {
  //     let filteredList = data.filter(function(item) {
  //       return item.title.includes(searchTerm);
  //     });
  //     res.json(filteredList);
  //   } else {
  //     res.json(data);
  //   }

  /**
   * Terse solution
   */
  //   const { searchTerm } = req.query;
  //   res.json(searchTerm ? data.filter(item => item.title.includes(searchTerm)) : data);

});

// Get a single item
app.get('/api/notes/:id', (req, res, next) => {
  const id = req.params.id;

  notes.find(id, (err, item) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(item); // responds with filtered array
  });
  /**
   * Verbose solution
   */
  //   let note = data.find(function(item) {
  //     return item.id === Number(id);
  //   });

  /**
   * Terse solution
   */
  // res.json(data.find(item => item.id === Number(id)));

});

app.put('/api/notes/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateFields = ['title', 'content'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  notes.update(id, updateObj, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.json(item);
    } else {
      next();
    }
  });
});

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({ message: 'Not Found' });
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

// Listen for incoming connections
app.listen(PORT, function () {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.error(err);
});