const {DataTypes} = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const Post = require("./Post")

const Comment = sequelize.define("Comment",{
    comment:{
        type:DataTypes.STRING,
        allowNull:false
    },
    userId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:User,
            key:"id"
        }
    },
    postId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Post,
            key:"id"
        }
    }
})

module.exports = Comment