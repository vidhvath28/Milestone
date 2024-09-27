
// spec/likeUnlikeSpec.js
const request = require('supertest');
const {User,Post,Comment,Like,Follow} = require('../models');
const { app } = require('../app');
const jwt = require('jsonwebtoken');
require('./helpers/dbSetup'); // Import centralized setup

describe('Like/Unlike API', () => {
    let user;
    let token;
    let post;

    beforeAll(async () => {
        user = await User.create({
            username: 'testuser' + Date.now(),
            email: 'testuser' + Date.now() + '@example.com',
            password: 'password123',
            fullname: 'Test User'
        });
        token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'default_jwt_secret', { expiresIn: '1h' });

        post = await Post.create({
            caption: 'Test Caption',
            image: 'test-image.jpg',
            hashtag: '#test',
            userId: user.id
        });
    });

    beforeEach(async () => {
        // Clear likes before each test
        await Like.destroy({ truncate: true, cascade: true });
    });

    describe('POST /api/posts/like', () => {
        it('[REQ037]_like_post_successfully', async () => {
            const response = await request(app)
                .post('/api/posts/like')
                .set('Authorization', `Bearer ${token}`)
                .send({ postId: post.id });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Post liked successfully' });

            const like = await Like.findOne({ where: { postId: post.id, userId: user.id } });
            expect(like).not.toBeNull();
        });

        it('[REQ038]_like_post_with_invalid_token', async () => {
            const response = await request(app)
                .post('/api/posts/like')
                .set('Authorization', 'Bearer invalid_token')
                .send({ postId: post.id });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
               success:false, message: 'Invalid credentials'
            });
        });
    });

    describe('POST /api/posts/unlike', () => {
        beforeEach(async () => {
            await Like.create({ postId: post.id, userId: user.id });
        });

        it('[REQ039]_unlike_post_successfully', async () => {
            const response = await request(app)
                .post('/api/posts/unlike')
                .set('Authorization', `Bearer ${token}`)
                .send({ postId: post.id });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Post unliked successfully' });

            const like = await Like.findOne({ where: { postId: post.id, userId: user.id } });
            expect(like).toBeNull();
        });

        it('[REQ040]_unlike_post_with_invalid_token', async () => {
            const response = await request(app)
                .post('/api/posts/unlike')
                .set('Authorization', 'Bearer invalid_token')
                .send({ postId: post.id });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
               success: false, message: "Invalid credentials"
            });
        });
    });
});
