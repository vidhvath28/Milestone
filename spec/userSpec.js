
// spec/testFile1.spec.js
const request = require('supertest');
const { User, Post, Comment, Like, Follow } = require('../models');
const { app } = require('../app');
require('./helpers/dbSetup'); // Import centralized setup

describe('User API', () => {
    beforeEach(async () => {
        await User.destroy({ truncate: true, cascade: true }); // Clear all users before each test
    });

    describe('POST /api/users/register', () => {
        beforeAll(() => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // Set timeout to 10 seconds globally
        });

        it('[REQ003]_register_new_user_successfully', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    username: 'testuser',
                    email: 'testuser@example.com',
                    password: 'password123',
                    fullname: 'abhi ag'
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                user: jasmine.any(Object), // Use jasmine.any for object comparison
                message: 'Registered Successfully'
            });
        });

        it('[REQ004]_not_register_a_user_with_an_existing_email', async () => {
            await User.create({
                username: 'anotheruser',
                email: 'testuser@example.com',
                password: 'password123',
                fullname: 'another ag'
            });

            const response = await request(app)
                .post('/api/users/register')
                .send({
                    username: 'newuser',
                    email: 'testuser@example.com',
                    password: 'password123',
                    fullname: 'new ag'
                });

            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                error: 'User already exists with that email'
            });
        });

        it('[REQ005]_not_register_a_user_with_an_existing_username', async () => {
            await User.create({
                username: 'testuser',
                email: 'newuser@example.com',
                password: 'password123',
                fullname: 'new ag'
            });

            const response = await request(app)
                .post('/api/users/register')
                .send({
                    username: 'testuser',
                    email: 'anotheruser@example.com',
                    password: 'password123',
                    fullname: 'another ag'
                });

            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                error: 'User already exists with that username'
            });
        });
    });
});
