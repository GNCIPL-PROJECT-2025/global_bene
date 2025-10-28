const express = require('express');
const { authRequired } = require('../middleware/auth');
const upload = require('../middleware/upload'); 
const {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getMyPosts
} = require('../controllers/postController');

const router = express.Router();

// Create post 
router.post('/', authRequired, upload.array('image',5), createPost);

//  Update post 
router.put('/:id', authRequired, upload.array('image',5), updatePost);

//  Delete post
router.delete('/:id', authRequired, deletePost);

//  Get all posts 
router.get('/', getAllPosts);

//  Get logged-in user's posts
router.get('/my/posts', authRequired, getMyPosts);

module.exports = router;
