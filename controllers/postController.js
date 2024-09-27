
const { where } = require("sequelize");
const { Op } = require("sequelize")
const { Post, User, Like, Comment, sequelize, Follow } = require("../models");
const { body, validationResult, Result } = require("express-validator");

const validateCreatePost = [
    body('caption').notEmpty().withMessage("Caption is required"),
    body('image').notEmpty().withMessage("Image is required")
]

const createPost = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { caption, image, hashtag } = req.body;
    const userId = req.user.id;
    try {
        const newPost = await Post.create({ caption, image, hashtag, userId });
        res.status(201).json(newPost)

    } catch (error) {
        console.error('Error creating posts:', error);
        res.status(500).json({ message: "Internal server error" })

    }
}

const getAllPost = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        const totalPostsCount = await Post.count()
        const posts = await Post.findAll({
            include: [
                {
                    model: User,
                    as: "postedBy",
                    attributes: ["username"]
                },
                {
                    model: Like,
                    as: "likes",
                    attributes: ["userId"]
                },
            ],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset
        });

        const formattedPosts = await Promise.all(posts.map(async (post) => {
            const commentCount = await Comment.count({ where: { postId: post.id } })
            return {
                id: post.id,
                profileImg: "https://cdn-icons-png.flaticon.com/128/3177/3177440.png",
                username: post.postedBy.username,
                time: post.createdAt,
                postImg: post.image,
                likeCount: post.likes.length,
                commentCount: commentCount,
                likedByUserIds: post.likes.map(like => like.userId),
                caption: post.caption
            }

        }))
        res.status(200).json({
            posts: formattedPosts,
            currentPage: page,
            totalPosts: totalPostsCount
        })
    } catch (error) {
        console.log("Error fetching posts :" + error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const likePost = async (req, res) => {
    try {
        const { postId } = req.body;
        const userId = req.user.id;

        // Find the post
        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }

        const existingLike = await Like.findOne({ where: { postId, userId } });

        if (existingLike) {
            return res.status(400).json({ message: "User already liked the post" })
        }

        await Like.create({ postId, userId })

        res.status(200).json({ message: "Post liked successfully" })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal server error" })

    }
}

const unlikePost = async (req, res) => {
    try {
        const { postId } = req.body;
        const userId = req.user.id;

        // Find the post
        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }

        const existingLike = await Like.findOne({ where: { postId, userId } });

        if (!existingLike) {
            return res.status(400).json({ message: "User not liked the post" })
        }


        await existingLike.destroy()

        res.status(200).json({ message: "Post unliked successfully" })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal server error" })

    }
}

const addComment = async (req, res) => {
    try {
        const { comment, postId } = req.body;
        const userId = req.user.id;

        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }
        console.log(comment, postId, userId);
        const newComment = await Comment.create({
            comment,
            postId, userId
        });
        console.log(newComment)

        const commentWithUser = await Comment.findOne({
            where: { id: newComment.id },
            include: [
                {
                    model: User,
                    as: "postedBy",
                    attributes: ["username"]
                }
            ]
        })

        res.status(201).json(commentWithUser)

    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" })

    }
}

const getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.findAll({
            where: { postId },
            include: [
                {
                    model: User,
                    as: "postedBy",
                    attributes: ["username", "id"]
                }
            ]
        })

        res.status(200).json(comments)

    } catch (err) {

    }
}

const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }

        if (post.userId !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this post" })
        }

        await Comment.destroy({ where: { postId } })
        await Like.destroy({ where: { postId } });
        await post.destroy()

        res.status(200).json({ message: "Post deleted successfully" })

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" })
    }
}

const getFollowingPost = async (req, res) => {
    try {

        const userId = req.user.id;
        console.log(userId);
        const followingUsers = await Follow.findAll({
            where: { followerId: userId },
        }
        )
        console.log(followingUsers);

        const followingUserIds = followingUsers.map((follow) => follow.followeeId);
        console.log(followingUserIds);
        if (followingUserIds.length === 0) {
            return res.status(200).json([])
        }
        console.log("Yeah we have followings");
        const posts = await Post.findAll({
            where: {
                userId: {
                    [Op.in]: followingUserIds
                }
            },
            include: [
                {
                    model: User,
                    as: "postedBy",
                    attributes: ['username']
                },
                {
                    model: Like,
                    as: "likes",
                    attributes: ['userId']
                },
                {
                    model: Comment,
                    as: "comments",
                    attributes: []
                }
            ],
            order: [['createdAt', "DESC"]],
            attributes: {
                include: [
                    [sequelize.fn("COUNT", sequelize.col("comments.id")), "commentCount"]
                ]
            },
            group: ["Post.id", "postedBy.id"]

        })

        const formattedPosts = posts.map((post) => ({
            id: post.id,
            profileImg: "https://cdn-icons-png.flaticon.com/128/3177/3177440.png",
            username: post.postedBy.username,
            time: post.createdAt,
            postImg: post.image,
            likeCount: post.likes.length,
            commentCount: post.getDataValue("commentCount"),
            likedByUserIds: post.likes.map(like => like.userId),
            caption: post.caption

        }));

        res.status(200).json(formattedPosts)

    } catch (err) {
        console.error("Error fetching posts from following users:", err)
        res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = { createPost, validateCreatePost, getAllPost, likePost, unlikePost, getComments, addComment, deletePost, getFollowingPost }
