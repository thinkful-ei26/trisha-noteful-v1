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

  notes.filter(searchTerm)
    .then(item => {
      console.log(searchTerm);
      if (item) {
        res.json(item);
        console.log(item);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });

});

// Get a single item
notesRouter.get('/notes/:id', (req, res, next) => {
  const id = req.params.id;

  notes.find(id)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
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

  notes.update(id, updateObj)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
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

  notes.create(newItem)
    .then(item => {
      if (item) {
        res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });


});


notesRouter.delete('/notes/:id', (req, res) => {
  const id = req.params.id;

  notes.delete(id)
    .then(item => {
      if (item) {
        console.log(`Deleted shopping list item \`${id}\``);
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(err => {
      err.status(500);
      return next(err); // goes to error handler
    });

  
});



module.exports = notesRouter;