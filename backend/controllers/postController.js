const Post = require('../models/Post');
const cloudinary = require('../config/cloudinary');

//  Create Post 
exports.createPost = async (req, res) => {
  try {
    const { title, body } = req.body;
    let mediaUrl = '';
    let mediaType = 'none';

    
    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        { folder: 'posts' },
        (error, uploadResult) => {
          if (error) {
            return res.status(500).json({ message: 'Cloudinary Upload Error', error });
          }
          mediaUrl = uploadResult.secure_url;
          mediaType = 'image';

          createPostInDb();
        }
      );

      
      result.end(req.file.buffer);
    } else {
      createPostInDb();
    }

    //  Function to create post in DB
    async function createPostInDb() {
      const newPost = new Post({
        authorId: req.user._id,
        title,
        body,
        mediaUrl,
        mediaType,
      });

      await newPost.save();
      res.status(201).json({
        message: 'Post created successfully',
        post: newPost
      });
    }
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};


//  Update Post 
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    let mediaUrl = post.mediaUrl;
    let mediaType = post.mediaType;

  
    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        { folder: 'posts' },
        (error, uploadResult) => {
          if (error) {
            return res.status(500).json({ message: 'Cloudinary Upload Error', error });
          }
          mediaUrl = uploadResult.secure_url;
          mediaType = 'image';

          updatePostInDb();
        }
      );
      result.end(req.file.buffer);
    } else {
      updatePostInDb();
    }

    async function updatePostInDb() {
      post.title = title || post.title;
      post.body = body || post.body;
      post.mediaUrl = mediaUrl;
      post.mediaType = mediaType;

      await post.save();
      res.json({ message: 'Post updated successfully', post });
    }
  } catch (error) {
    console.error('Update Post Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};


// Delete Post
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    await Post.findByIdAndDelete(id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete Post Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};


//  Get All Posts (Public)
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('authorId', 'username email');
    res.json({ message: 'Posts fetched successfully', posts });
  } catch (error) {
    console.error('Fetch Posts Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};


//  Get Logged-in User's Posts
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ authorId: req.user._id });
    res.json({ message: 'My posts fetched successfully', posts });
  } catch (error) {
    console.error('Fetch My Posts Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};
