const request = require('supertest');
const { User, Post, Comment, Like, Follow } = require('../models');
const { app } = require('../app');
const jwt = require('jsonwebtoken');
require('./helpers/dbSetup'); // Import centralized setup

describe('Delete Post API', () => {
    let user;
    let token;
    let post;

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
        post = await Post.create({
            caption: 'Test Caption',
            image: 'test-image.jpg',
            hashtag: '#test',
            userId: user.id
        });
    });

    describe('DELETE /api/posts/delete/:postId', () => {
        it('[REQ051]_delete_post_successfully', async () => {
            const response = await request(app)
                .delete(`/api/posts/delete/${post.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Post deleted successfully'
            });

            const deletedPost = await Post.findByPk(post.id);
            expect(deletedPost).toBeNull();
        });

        it('[REQ052]_not_delete_post_with_invalid_token', async () => {
            const response = await request(app)
                .delete(`/api/posts/delete/${post.id}`)
                .set('Authorization', 'Bearer invalid_token');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                success: false,
                message: 'Invalid credentials'
            });

            const existingPost = await Post.findByPk(post.id);
            expect(existingPost).not.toBeNull();
        });

        it('[REQ053]_not_delete_post_if_not_owner', async () => {
            // Create another user
            const anotherUser = await User.create({
                username: 'anotheruser' + Date.now(),
                email: 'anotheruser' + Date.now() + '@example.com',
                password: 'password123',
                fullname: 'Another User'
            });

            const anotherToken = jwt.sign({ id: anotherUser.id }, process.env.JWT_SECRET || 'default_jwt_secret', { expiresIn: '1h' });

            const response = await request(app)
                .delete(`/api/posts/delete/${post.id}`)
                .set('Authorization', `Bearer ${anotherToken}`);

            expect(response.status).toBe(403);
            expect(response.body).toEqual({
                message: 'You are not authorized to delete this post'
            });

            const existingPost = await Post.findByPk(post.id);
            expect(existingPost).not.toBeNull();
        });

        it('[REQ054]_not_delete_non_existing_post', async () => {
            const nonExistingPostId = 99999;

            const response = await request(app)
                .delete(`/api/posts/delete/${nonExistingPostId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                message: 'Post not found'
            });
        });
    });
});