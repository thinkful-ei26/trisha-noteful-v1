'use strict';

const express = require('express');
const notesRouter = express.Router();

// Load array of notes
const data = require('../db/notes');
const simDB = require('../db/simDB');
const notes = simDB.initialize(data);


// Get All (and search by query)
notesRouter.get('/notes', (req, res, next) => {

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
notesRouter.get('/notes/:id', (req, res, next) => {
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

notesRouter.put('/notes/:id', (req, res, next) => {
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

// Post (insert) an item
notesRouter.post('/notes', (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  notes.create(newItem, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
    } else {
      next();
    }
  });
});


notesRouter.delete('/notes/:id', (req, res) => {
  const id = req.params.id;

  notes.delete(id, (err) => {
    if (err) {
      err.status(500);
      return next(err); // goes to error handler
    }
    console.log(`Deleted shopping list item \`${req.params.ID}\``);
    res.status(204).end();
  });
  
});



module.exports = notesRouter;