
const { Post, User, Like, Follow } = require("../models");
const {Op} = require("sequelize")


const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(400).json({
                success: false,
                message: "User information is missing or incomplete"
            })
        }

        const { id, fullname, username } = req.user

        const posts = await Post.findAll({
            where: { userId: id },
            attributes: ['image', 'id']
        })

        res.status(200).json({
            success: true,
            user: { id, username, fullname },
            posts
        })


    } catch (err) {
        console.log("Error fething profile details :", err)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const getProfileByUsername = async (req, res) => {
    const { username } = req.params
    try {
        const user = await User.findOne({
            where: { username },
            include: [
                {
                    model: Post,
                    as: "posts",
                    include: [
                        {
                            model: Like,
                            as: "likes"
                        }
                    ]
                },
                {
                    model: User,
                    as: "Followers",
                    attributes: ["id", "username"]
                },
                {
                    model: User,
                    as: "Following",
                    attributes: ["id", "username"]
                }
            ]
        })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                fullname: user.fullname,
                followers: user.Followers,
                following: user.Following
            },
            posts: user.posts
        })

    } catch (err) {
        console.log("Error fething profile details :", err)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const followUser = async (req, res) => {
    const { followeeId } = req.params;
    const followerId = req.user.id

    console.log(followeeId, followerId);

    try {
        const followee = await User.findByPk(followeeId);
        if (!followee) {
            return res.status(404).json({
                success: false,
                message: "User to follow not found"
            })
        }

        if (followeeId === followerId) {
            return res.status(404).json({
                success: false,
                message: "You cannot follow yourself"
            })
        }

        const existingFollow = await Follow.findOne({
            where: { followeeId, followerId }
        })

        if (existingFollow) {
            return res.status(404).json({
                message: "You are already following this user"
            })
        }

        await Follow.create({ followeeId, followerId });

        return res.status(201).json({
            success: true,
            message: "Successfully followed the user"
        })

    } catch (err) {
        console.log("Error fething profile details :", err)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const unfollowUser = async (req, res) => {
    const { followeeId } = req.params;
    const followerId = req.user.id
    console.log(followeeId, followerId);
    try {
        const follow = await Follow.findOne({
            where: { followeeId, followerId }
        })

        if (!follow) {
            return res.status(404).json({
                success: false,
                message: "You are not following this user"
            })
        }

        await follow.destroy()
        return res.status(200).json({
            success: true,
            message: "Successfully unfollowed the user"
        })

    } catch (err) {
        console.log("Error fething profile details :", err)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const updateProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.id;
        const { profilePhoto } = req.body

        if (!profilePhoto || typeof profilePhoto !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid profile photo URL"
            })
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" })
        }

        user.profilePhoto = profilePhoto
        await user.save()

        res.status(200).json({
            success: true,
            message: "Profile photo updated successfully",
            user: { profilePhoto: user.profilePhoto }
        })
    } catch (err) {
        console.log("Error fething profile details :", err)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const deleteProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        user.profilePhoto = null
        await user.save()

        return res.status(200).json({
            success: true,
            message: "Profile photo deleted successfully",
            user: {
                id: user.id,
                username: user.username,
                profilePhoto: user.profilePhoto
            }
        })

    } catch (err) {
        console.log(`Error in delete profile photo :`, err)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const searchUsers = async (req, res) => {
    const { query } = req.query
    try {

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            })
        }

        const users = await User.findAll({
            where:{
                username:{
                    [Op.like] : `%${query}%`
                }
            },
            attributes:["id","username","fullname","profilePhoto"]
        })

        if(users.length === 0){
            return res.status(200).json({
                success:true,
                message:"No users found"
            })
        }

        return res.status(200).json({
            success:true,
            users
        })


    } catch (err) {
        console.log("Error searching users", err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })

    }
}



module.exports = { searchUsers, getProfile, getProfileByUsername, followUser, unfollowUser, updateProfilePhoto, deleteProfilePhoto }