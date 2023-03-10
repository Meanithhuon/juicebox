const express = require('express');
const { getAllPosts, createPost, getPostById, updatePost} = require('../db'); // import the getAllPosts function from the db
const postsRouter = express.Router(); // Create a new router
const { requireUser } = require('./utils');

// Route for getting all posts
postsRouter.get('/', async (req, res, next) => {
  try {
    const allPosts = await getAllPosts(); // call the getAllPosts function from the db
    const posts = allPosts.filter(post => {
      return post.active || (req.user && post.author.id === req.user.id);
    });
    // keep a post if it is either active, or if it belongs to the current user
    res.send({ posts }); // Send the result as a json object with key 'posts' and the value of the array
  } catch (error) {
    next(error);
  }
});

postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;
  const tagArr = tags.trim().split(/\s+/)
  const postData = {};
  // only send the tags if there are some to send
  if (tagArr.length) {
    postData.tags = tagArr;
  }
  try {
    postData.authorId = req.user.id;
    postData.title = title;
    postData.content = content;
    postData.tags = tagArr;
    const post = await createPost(postData);
    if (post){
      res.send({ post });
      //next() 
    } else {
      next({ name, message });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }});

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;
  const updateFields = {};
  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }
  if (title) {
    updateFields.title = title;
  }
  if (content) {
    updateFields.content = content;
  }
  try {
    const originalPost = await getPostById(postId);
    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost })
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours'
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);
    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });
      res.send({ post: updatedPost });
    } else {
      // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
      next(post ? { 
        name: "UnauthorizedUserError",
        message: "You cannot delete a post which is not yours"
      } : {
        name: "PostNotFoundError",
        message: "That post does not exist"
      });
    }
  } catch ({ name, message }) {
    next({ name, message })
  }
});

module.exports = postsRouter; // export the postsRouter