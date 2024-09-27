const { Post, User, sequelize } = require('./models'); // Adjust the path according to your project structure
const bcryptjs = require("bcryptjs")
const seedPosts = async () => {
    try {
        // Sync database schema
        await sequelize.sync();
        console.log("Database & tables synced");
        const hashPassword = await bcryptjs.hash("password", 10)
        // Create a single user
        const user = await User.create({
            username: "demouser",
            fullname: "Test User",
            email: "demo@example.com",
            password: hashPassword
        });

        if (user) {
            console.log('User created successfully:', user);

            // Insert 5 sample posts by the same user
            await Post.bulkCreate([
                {
                    caption: "First post!",
                    image: "https://cdn.pixabay.com/photo/2024/07/14/11/09/ai-generated-8894138_640.jpg",
                    hashtag: "#first",
                    userId: user.dataValues.id
                },
                {
                    caption: "Love this view!",
                    image: "https://cdn.pixabay.com/photo/2023/12/28/19/14/boy-8474750_1280.jpg",
                    hashtag: "#view",
                    userId: user.dataValues.id
                },
                {
                    caption: "Amazing adventure",
                    image: "https://cdn.pixabay.com/photo/2023/05/07/09/59/mountains-7976041_640.jpg",
                    hashtag: "#adventure",
                    userId: user.dataValues.id
                },
                {
                    caption: "Delicious food",
                    image: "https://cdn.pixabay.com/photo/2023/08/26/14/19/cupcake-8215179_1280.jpg",
                    hashtag: "#food",
                    userId: user.dataValues.id
                },
                {
                    caption: "Chilling with friends",
                    image: "https://cdn.pixabay.com/photo/2020/07/15/15/25/friends-5408036_640.png",
                    hashtag: "#friends",
                    userId: user.dataValues.id
                }
            ]);

            console.log("Seed data inserted successfully");
        } else {
            console.error("Failed to create user");
        }
    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        // Close the database connection
        await sequelize.close();
    }
};

// Execute the seeding function
seedPosts();