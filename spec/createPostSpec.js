
// spec/testFile3.spec.js
const request = require('supertest');
const { User, Post, Comment, Like, Follow } = require('../models');
const { app } = require('../app');
const jwt = require('jsonwebtoken');
require('./helpers/dbSetup'); // Import centralized setup

describe('Post API', () => {
    let user;
    let token;

    beforeAll(async () => {
        user = await User.create({
            username: 'testuser' + Date.now(), // Ensure unique username
            email: 'testuser' + Date.now() + '@example.com', // Ensure unique email
            password: 'password123',
            fullname: 'Test User'
        });
        token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'default_jwt_secret', { expiresIn: '1h' });
    });

    beforeEach(async () => {
        await Post.destroy({ truncate: true, cascade: true });
    });

    describe('POST /api/posts/create', () => {
        it('[REQ023]_create_new_post_successfully', async () => {
            const response = await request(app)
                .post('/api/posts/create')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    caption: 'Test Caption',
                    image: 'test-image.jpg',
                    hashtag: '#test'
                });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                id: jasmine.any(Number),
                caption: 'Test Caption',
                image: 'test-image.jpg',
                hashtag: '#test',
                userId: user.id,
                createdAt: jasmine.any(String),
                updatedAt: jasmine.any(String)
            });
        });

        it('[REQ024]_not_create_post_with_missing_required_fields', async () => {
            const response = await request(app)
                .post('/api/posts/create')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    image: 'test-image.jpg'
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual([
                {
                    "type": "field",
                    "msg": "Caption is required",
                    "path": "caption",
                    "location": "body"
                }
            ]);
        });

        it('[REQ025]_not_create_post_with_invalid_token', async () => {
            const response = await request(app)
                .post('/api/posts/create')
                .set('Authorization', 'Bearer invalid_token')
                .send({
                    caption: 'Test Caption',
                    image: 'test-image.jpg',
                    hashtag: '#test'
                });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                success: false,
                message: 'Invalid credentials'
            });
        });
    });
});
