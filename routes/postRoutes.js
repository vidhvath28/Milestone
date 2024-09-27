
const express = require("express");
const router = express.Router();
const { createPost, deletePost, validateCreatePost, getFollowingPost, getAllPost, likePost, unlikePost, getComments, addComment } = require("../controllers/postController.js");
const authorizeUser = require("../middlewares/authorizeUser.js");

router.post("/create", authorizeUser, validateCreatePost, createPost);
router.get("/getAll", getAllPost)
router.post("/like", authorizeUser, likePost)
router.post("/unlike", authorizeUser, unlikePost);
router.get("/getComments/:postId", getComments)
router.post("/addComments", authorizeUser, addComment)
router.delete("/delete/:postId", authorizeUser, deletePost);
router.get("/following-posts", authorizeUser, getFollowingPost)


module.exports = router
