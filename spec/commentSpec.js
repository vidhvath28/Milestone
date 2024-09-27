
const request = require('supertest');
const {User,Post,Comment,Like,Follow} = require('../models');

const { app } = require('../app');
const jwt = require('jsonwebtoken');
require('./helpers/dbSetup');

describe('Comment API', () => {
    let user;
    let token;
    let post;

    beforeAll(async () => {
        user = await User.create({
            username: 'testuser' + Date.now(),
            email: 'testuser' + Date.now() + '@example.com',
            password: 'Shivam@123',
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
        await Comment.destroy({ truncate: true, cascade: true });
    });

    describe('POST /api/posts/addComments', () => {
        it('[REQ043]_add_comment_successfully', async () => {
            const response = await request(app)
                .post('/api/posts/addComments')
                .set('Authorization', `Bearer ${token}`)
                .send({ postId: post.id, comment: 'Test comment', userId: user.id });

            expect(response.status).toBe(201);
            expect(response.body.comment).toBe('Test comment');
            expect(response.body.userId).toBe(user.id);
            expect(response.body.postId).toBe(post.id);
        });

        it('[REQ044]_add_comment_with_invalid_token', async () => {
            const response = await request(app)
                .post('/api/posts/addComments')
                .set('Authorization', 'Bearer invalid_token')
                .send({ postId: post.id, comment: 'Test comment', userId: user.id });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                success: false, message: 'Invalid credentials'
            });
        });
    });

    describe('GET /api/posts/getComments/:postId', () => {
        it('[REQ045]_fetch_comments_successfully', async () => {
            await Comment.create({ comment: 'Test comment', userId: user.id, postId: post.id });

            const response = await request(app).get(`/api/posts/getComments/${post.id}`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].comment).toBe('Test comment');
            expect(response.body[0].userId).toBe(user.id);
            expect(response.body[0].postId).toBe(post.id);
        });

        it('[REQ046]_fetch_comments_for_invalid_postId', async () => {
            const response = await request(app).get('/api/posts/getComments/9999');

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(0);
        });
    });
});
