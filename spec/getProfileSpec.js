
const request = require('supertest');
const {User,Post,Comment,Like,Follow} = require('../models');
const { app } = require('../app');
const jwt = require('jsonwebtoken');
require('./helpers/dbSetup'); // Import centralized setup

// Increase the default timeout interval
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000; // 30 seconds

describe('Profile API', () => {
    let user;
    let token;

    beforeAll(async () => {
        try {
            // Ensure unique email and username
            user = await User.create({
                username: 'testuser_' + Date.now(), // Ensure unique username
                email: 'testuser' + Date.now() + '@example.com', // Ensure unique email
                password: 'password123',
                fullname: 'Test User'
            });

            // Generate a JWT token for the created user
            token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'default_jwt_secret', { expiresIn: '1h' });

            // Create some posts to fetch later
            await Post.bulkCreate([
                {
                    caption: 'First post!',
                    image: 'https://example.com/image1.jpg',
                    hashtag: '#first',
                    userId: user.id
                },
                {
                    caption: 'Second post!',
                    image: 'https://example.com/image2.jpg',
                    hashtag: '#second',
                    userId: user.id
                },
                {
                    caption: 'Third post!',
                    image: 'https://example.com/image3.jpg',
                    hashtag: '#third',
                    userId: user.id
                }
            ]);
        } catch (error) {
            console.error('Error during beforeAll setup:', error);
            throw error;
        }
    });

    afterAll(async () => {
        // Clean up database
        await Post.destroy({ truncate: true, cascade: true });
        await User.destroy({ truncate: true, cascade: true });
    });

    describe('GET /api/users/profile', () => {
        it('[REQ029]_fetch_user_profile_successfully', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBeTruthy(); // Ensure the success field is true
            expect(response.body.user).toBeTruthy(); // Ensure user data is present
            expect(response.body.user.id).toBe(user.id);
            expect(response.body.user.fullname).toBe(user.fullname);
            expect(response.body.user.username).toBe(user.username);
            expect(response.body.user.password).toBeUndefined(); // Ensure password is not included
            expect(response.body.posts).toBeTruthy(); // Ensure posts array is present
            
            
        });

        it('[REQ030]_fetch_profile_with_invalid_token', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', 'Bearer invalid_token');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                success: false,
                message: 'Invalid credentials'
            });
        });


    });
});
