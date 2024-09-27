
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const Post = require("./Post");


const Like = sequelize.define("Like", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Post,
            key: "id"
        }
    }
})

module.exports = Like
