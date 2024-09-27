const {DataTypes} = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Post = sequelize.define("Post",{
    caption:{
        type:DataTypes.STRING,
        allowNull:false
    },
    image:{
        type:DataTypes.STRING,
        allowNull:false
    },
    hashtag:{
        type:DataTypes.STRING,
        allowNull:true
    },
    userId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:User,
            key:"id"
        }
    }

},{
    timestamps:true
})

module.exports = Post