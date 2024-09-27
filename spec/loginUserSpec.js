
// spec/testFile2.spec.js
const request = require('supertest');
const {User,Post,Comment,Like,Follow} = require('../models');
const { app } = require('../app');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret'; // Use a default for testing
require('./helpers/dbSetup'); // Import centralized setup

describe('User API - Login', () => {
    beforeEach(async () => {
        await User.destroy({ truncate: true, cascade: true }); // Clear all users before each test
    });

    describe('POST /api/users/login', () => {
        beforeAll(() => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // Set timeout to 10 seconds globally
        });

        it('[REQ009]_login_successfully_with_correct_credentials', async () => {
            // Hash the password before storing
            const hashedPassword = await bcryptjs.hash('password123', 10);

            await User.create({
                username: 'testuser',
                email: 'testuser@example.com',
                password: hashedPassword,
                fullname: 'abhi ag'
            });

            const response = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'testuser@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: jasmine.any(Number),
                username: jasmine.any(String),
                token: jasmine.any(String), // Use jasmine.any for object comparison
                message: 'Login Successfully'
            });
        });

        it('[REQ007]_fail_login_with_incorrect_password', async () => {
            const hashedPassword = await bcryptjs.hash('password123', 10);

            await User.create({
                username: 'testuser',
                email: 'testuser@example.com',
                password: hashedPassword,
                fullname: 'abhi ag'
            });

            const response = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'testuser@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                error: 'Invalid password'
            });
        });

        it('[REQ008]_fail_login_with_non_existent_email', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'nonexistentuser@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                error: 'User Not Found with Given email'
            });
        });
    });
});
