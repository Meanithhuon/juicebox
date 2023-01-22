
const express = require('express');
const { getAllTags,  getPostsByTagName } = require('../db'); // import the getAllTags function from the db
const tagsRouter = express.Router(); // Create a new router

// Middleware function to run when the user makes a GET request to '/api/tags'
tagsRouter.use('/', async (req, res, next) => {
  console.log("A request is being made to /api/tags");
  try {
    const tags = await getAllTags(); // call the getAllTags function from the db
    res.send({ tags }); // Send the result as a json object with key 'tags' and the value of the array
  } catch (error) {
    next(error);
  }
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
  try {
    // read the tagname from the params
    const tagName = req.params.tagName;
    // use our method to get posts by tag name from the db
    const posts = await getPostsByTagName(tagName);
    // send out an object to the client { posts: // the posts }
    res.send({ posts });
  } catch ({ name, message }) {
    // forward the name and message to the error handler
    next({ name, message });
  }
});

module.exports = tagsRouter; // export the tagsRouter