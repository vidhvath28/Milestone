const request = require('supertest');
const { User } = require('../models');
const { app } = require('../app');
const jwt = require('jsonwebtoken');
require('./helpers/dbSetup'); // Import centralized setup

describe('User Search API', () => {
    let user;
    let token;

    beforeAll(async () => {
        try {
            // Ensure unique email and username
            await User.destroy({ where: {}, truncate: true }); // Clear all users before running tests

            user = await User.create({
                username: 'testuser_' + Date.now(), // Ensure unique username
                email: 'testuser' + Date.now() + '@example.com', // Ensure unique email
                password: 'password123',
                fullname: 'Test User'
            });

            // Generate a JWT token for the created user
            token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'default_jwt_secret', { expiresIn: '1h' });

            // Create additional users for search functionality tests
            await User.bulkCreate([
                {
                    username: 'searchuser1',
                    email: 'searchuser1@example.com',
                    password: 'password123',
                    fullname: 'Search User One'
                },
                {
                    username: 'searchuser2',
                    email: 'searchuser2@example.com',
                    password: 'password123',
                    fullname: 'Search User Two'
                }
            ]);
        } catch (error) {
            console.error('Error during beforeAll setup:', error);
            throw error;
        }
    });

    describe('GET /api/users/search', () => {
        it('[REQ076]_search_users_successfully', async () => {
            const response = await request(app)
                .get('/api/users/search')
                .set('Authorization', `Bearer ${token}`)
                .query({ query: 'searchuser' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                users: jasmine.arrayContaining([
                    jasmine.objectContaining({
                        id: jasmine.any(Number),
                        username: jasmine.stringContaining('searchuser'),
                        fullname: jasmine.stringContaining('Search User'),

                    })
                ])
            });
        });


        it('[REQ077]_search_users_no_results', async () => {
            const response = await request(app)
                .get('/api/users/search')
                .set('Authorization', `Bearer ${token}`)
                .query({ query: 'nonexistentuser' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "No users found"
            });
        });

    });
});