const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("cloudinary");
exports.createPost = async (req, res) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
    folder: "posts",
  });
  try {
    const newPostData = {
      caption: req.body.caption,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      owner: req.user._id,
    };
    const post = await Post.create(newPostData);
    res.status(201).json({ success: true, message: "POST CREATED" });
    const user = await User.findById(req.user._id);
    user.posts.unshift(post._id);
    await user.save();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "POST NOT FOUND" });
    }
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Unauthorize" });
    }
    await cloudinary.v2.uploader.destroy(post.image.public_id);
    await post.remove();
    const user = await User.findById(req.user._id);
    const index = user.posts.indexOf(req.params.id);
    user.posts.splice(index, 1);
    await user.save();
    res.status(200).json({ success: true, message: "POST DELETED" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.likeAndUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "POST NOT FOUND" });
    }
    if (post.likes.includes(req.user._id)) {
      const index = post.likes.indexOf(req.user._id);
      post.likes.splice(index, 1);
      await post.save();
      return res.status(200).json({ success: true, message: "POST UNLIKED" });
    } else {
      post.likes.push(req.user._id);
      await post.save();
      return res.status(200).json({ success: true, message: "POST LIKED" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCaption = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "POST NOT FOUND" });
    }
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "UNAUTHORIZE" });
    }
    post.caption = req.body.caption;
    await post.save();
    res.status(200).json({ success: true, message: "POST UPDATED" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPostOfFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = await Post.find({
      owner: {
        $in: user.following,
      },
    }).populate("owner likes comments.user");
    res.status(200).json({ success: true, posts: posts.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.commentOnPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "POST NOT FOUND" });
    }
    let commentExist = -1;
    //? checking if comment already exist

    post.comments.forEach((item, index) => {
      if (item.user.toString() === req.user._id.toString()) {
        commentExist = index;
      }
    });
    if (commentExist !== -1) {
      post.comments[commentExist].comment = req.body.comment;
      await post.save();
      return res
        .status(200)
        .json({ success: true, message: "COMMENT UPDATED" });
    } else {
      post.comments.push({ user: req.user._id, comment: req.body.comment });
      await post.save();
      return res.status(200).json({ success: true, message: "COMMENT ADDED" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: true, message: "POST NOT FOUND" });
    }
    if (post.owner.toString() === req.user._id.toString()) {
      if (req.body.commentId == undefined) {
        return res
          .status(401)
          .json({ success: false, message: "COMMENT ID REQUIRED" });
      }
      post.comments.forEach((item, index) => {
        if (item._id.toString() === req.body.commentId.toString()) {
          return post.comments.splice(index, 1);
        }
      });
      await post.save();
      return res
        .status(200)
        .json({ success: true, message: "SELECTED COMMENT DELETED" });
    } else {
      post.comments.forEach((item, index) => {
        if (item.user.toString() === req.user._id.toString()) {
          return post.comments.splice(index, 1);
        }
      });
      await post.save();
      res
        .status(200)
        .json({ success: true, message: "Your comment has deleted" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
