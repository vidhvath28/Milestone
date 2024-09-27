
// spec/runTests.js
const Jasmine = require('jasmine');
const jasmine = new Jasmine();
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;

// Configure Jasmine to use the SpecReporter
jasmine.env.clearReporters();
jasmine.addReporter(new SpecReporter({
    spec: {
        displayPending: true,
    }
}));
jasmine.randomizeTests(false);  // Ensure tests run in order


// Import all test files
require("./followUnfollowSpec")
require('./userSpec.js');
require('./loginUserSpec.js');
require('./createPostSpec.js');
require('./authorizeUserSpec.js');
require('./getAllPostSpec.js');
require("./getProfileSpec.js")
require("./likeUnlikeSpec.js")
require("./commentSpec.js")
require("./deletePostSpec.js")
require("./profilePhotoSpec.js");
require("./getMyFollowingPostSpec.js");
require("./googleLoginSpec.js");
require("./userSearchSpec.js")

// Run the tests
jasmine.execute();
