const sequelize = require("../config/db");
const User = require("./User.js");
const Post = require("./Post.js");
const Like = require("./Like.js");
const Comment = require("./comment.js");
const Follow = require("./Follow.js");

// User and Post Association
User.hasMany(Post, { foreignKey: "userId", as: "posts", onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: "userId", as: "postedBy" });

// Post and Like Association
Like.belongsTo(Post, { foreignKey: "postId", as: "post", onDelete: 'CASCADE' });
Post.hasMany(Like, { foreignKey: 'postId', as: "likes", onDelete: 'CASCADE' });

// User and Like Association
Like.belongsTo(User, { foreignKey: "userId", as: "likedBy", onDelete: 'CASCADE' });
User.hasMany(Like, { foreignKey: "userId", as: "likes", onDelete: 'CASCADE' });  // Changed alias from "like" to "likes" for consistency

// User and Comment Association
User.hasMany(Comment, { foreignKey: "userId", as: "comments", onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: "userId", as: "postedBy" });

// Post and Comment Association
Post.hasMany(Comment, { foreignKey: "postId", as: "comments", onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: "postId", as: "post", onDelete: 'CASCADE' });

// Follow Association (User to User through Follow)
User.belongsToMany(User, { through: Follow, as: 'Followers', foreignKey: 'followeeId', onDelete: 'CASCADE' });
User.belongsToMany(User, { through: Follow, as: 'Following', foreignKey: 'followerId', onDelete: 'CASCADE' });

module.exports = {
    sequelize,
    Post,
    User,
    Like,
    Comment,
    Follow
};