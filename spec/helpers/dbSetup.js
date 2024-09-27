
// spec/helpers/dbSetup.js
const { sequelize } = require('../../models');
const { server } = require('../../app');

beforeAll(async () => {
    await sequelize.sync({ force: true }); // Ensure a clean database
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000; // Set timeout to 10 seconds globally
});

afterAll(async () => {
    await sequelize.close();
    server.close();
});
