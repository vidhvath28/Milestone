
const request = require('supertest');
const { User } = require('../models');
const { app } = require('../app');
require('./helpers/dbSetup');

describe('User API - Complete Profile', () => {
    beforeEach(async () => {
        await User.destroy({ truncate: true, cascade: true }); // Clear users before each test
    });

    it('[REQ070]_complete_profile_success', async () => {
        const newUser = await User.create({
            fullname: 'New User',
            email: 'newuser@example.com',
            googleId: 'googleId123',
            profilePhoto: 'photoUrl',
        });

        const response = await request(app)
            .post('/api/users/complete-profile')
            .send({
                userId: newUser.id,
                username: 'newusername'
            });

        const updatedUser = await User.findByPk(newUser.id);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Profile completed successfully'
        });
        expect(updatedUser.username).toBe('newusername');
    });

    it('[REQ071]_complete_profile_username_taken', async () => {
        await User.create({
            username: 'existingusername',
            fullname: 'Existing User',
            email: 'existinguser@example.com',
            googleId: 'googleId123',
            profilePhoto: 'photoUrl',
        });

        const newUser = await User.create({
            fullname: 'Another User',
            email: 'anotheruser@example.com',
            googleId: 'googleId456',
            profilePhoto: 'photoUrl',
        });

        const response = await request(app)
            .post('/api/users/complete-profile')
            .send({
                userId: newUser.id,
                username: 'existingusername'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: 'Username already taken'
        });
    });
});
