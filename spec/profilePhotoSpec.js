
const request = require('supertest');
const { User, Post, Comment, Like, Follow } = require('../models');
const { app } = require('../app');
const jwt = require('jsonwebtoken');
require('./helpers/dbSetup');

describe('Profile Photo Update and Delete API', () => {
    let user, token;

    beforeAll(async () => {
        user = await User.create({
            username: 'testuser' + Date.now(),
            email: 'testuser' + Date.now() + '@example.com',
            password: 'Password123',
            fullname: 'Test User'
        });

        token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'default_jwt_secret', { expiresIn: '1h' });
    });


    it('[REQ062]_update_profile_photo_successfully', async () => {
        const response = await request(app)
            .put('/api/users/profile/photo')
            .set('Authorization', `Bearer ${token}`)
            .send({ profilePhoto: 'https://media.istockphoto.com/id/183821822/photo/say.jpg?s=612x612&w=0&k=20&c=kRmCjTzA9cq4amgRgeHkZsZuvxezUtC8wdDYfKg-mho=' });

        console.log("response.body", response.body);
        console.log("token", token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Profile photo updated successfully');
        expect(response.body.user.profilePhoto).toBe('https://media.istockphoto.com/id/183821822/photo/say.jpg?s=612x612&w=0&k=20&c=kRmCjTzA9cq4amgRgeHkZsZuvxezUtC8wdDYfKg-mho=');
    });

    it('[REQ063]_delete_profile_photo_successfully', async () => {
        const response = await request(app)
            .delete('/api/users/profile/photo')
            .set('Authorization', `Bearer ${token}`)
            .send({ profilePhoto: 'https://media.istockphoto.com/id/183821822/photo/say.jpg?s=612x612&w=0&k=20&c=kRmCjTzA9cq4amgRgeHkZsZuvxezUtC8wdDYfKg-mho=' });

        console.log("response.body", response.body);
        console.log("token", token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Profile photo deleted successfully');
    });
});
