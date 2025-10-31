import cloudinary from "../config/cloudinary.js"; //  Create Post
export async function createPost(req, res) {
  try {
    const { title, body } = req.body;
    let mediaUrl = "";
    let mediaType = "none";

    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        { folder: "posts" },
        (error, uploadResult) => {
          if (error) {
            return res
              .status(500)
              .json({ message: "Cloudinary Upload Error", error });
          }
          mediaUrl = uploadResult.secure_url;
          mediaType = "image";

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
        message: "Post created successfully",
        post: newPost,
      });
    }
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
}

//  Update Post
export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { title, body } = req.body;

    const post = await findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    let mediaUrl = post.mediaUrl;
    let mediaType = post.mediaType;

    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        { folder: "posts" },
        (error, uploadResult) => {
          if (error) {
            return res
              .status(500)
              .json({ message: "Cloudinary Upload Error", error });
          }
          mediaUrl = uploadResult.secure_url;
          mediaType = "image";

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
      res.json({ message: "Post updated successfully", post });
    }
  } catch (error) {
    console.error("Update Post Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
}

//  Upvote a Post
export const upvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;

    if (post.upvotes.includes(userId)) {
      // If already upvoted, remove (toggle off)
      post.upvotes.pull(userId);
    } else {
      // Remove from downvotes if present
      post.downvotes.pull(userId);
      post.upvotes.push(userId);
    }

    await post.save();
    res.json({ success: true, message: "Upvote updated", post });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Downvote a Post
export const downvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;

    if (post.downvotes.includes(userId)) {
      // If already downvoted, remove (toggle off)
      post.downvotes.pull(userId);
    } else {
      // Remove from upvotes if present
      post.upvotes.pull(userId);
      post.downvotes.push(userId);
    }

    await post.save();
    res.json({ success: true, message: "Downvote updated", post });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Post
export async function deletePost(req, res) {
  try {
    const { id } = req.params;

    const post = await findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await findByIdAndDelete(id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete Post Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
}

//  Get All Posts (Public)
export async function getAllPosts(req, res) {
  try {
    const posts = await find().populate("authorId", "username email");
    res.json({ message: "Posts fetched successfully", posts });
  } catch (error) {
    console.error("Fetch Posts Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
}

//  Get Logged-in User's Posts
export async function getMyPosts(req, res) {
  try {
    const posts = await find({ authorId: req.user._id });
    res.json({ message: "My posts fetched successfully", posts });
  } catch (error) {
    console.error("Fetch My Posts Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
}
