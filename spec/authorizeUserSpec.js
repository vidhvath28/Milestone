
// spec/testFile4.spec.js
const request = require('supertest');
const { User } = require('../models');
const { app } = require('../app');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
require('./helpers/dbSetup'); // Import centralized setup

describe('authenticateUser Middleware', () => {
    beforeEach(async () => {
        await User.destroy({ truncate: true, cascade: true });
    });

    it('[REQ020]_should_return_401_if_no_authorization_header', (done) => {
        request(app)
            .get('/test')
            .expect(401)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.success).toBe(false);
                expect(res.body.message).toBe('Authentication required');
                done();
            });
    });

    it('[REQ021]_should_return_401_if_invalid_token', (done) => {
        const invalidToken = jwt.sign({ id: 'invalid' }, 'wrongsecret');

        request(app)
            .get('/test')
            .set('Authorization', `Bearer ${invalidToken}`)
            .expect(401)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.success).toBe(false);
                expect(res.body.message).toBe('Invalid credentials');
                done();
            });
    });

    it('[REQ022]_should_call_next_if_token_is_valid_and_user_exists', async () => {
        const user = await User.create({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
            fullname: 'Test User'
        });

        const validToken = jwt.sign({ id: user.dataValues.id }, JWT_SECRET);

        const response = await request(app)
            .get('/test')
            .set('Authorization', `Bearer ${validToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.user).toBeDefined();
        expect(response.body.user.id).toBe(user.id);
    });
});
