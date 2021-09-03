const { assert } = require('chai');

const  getUserByEmail  = require('../helpers.js');

//const cookieSession = require('cookie-session');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
  
    assert.equal(user, expectedOutput);
  });

  it('should return undefined with no email argument', function() {
   const user = getUserByEmail("", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });

  it('should return undefined when email does not exist', function() {
   const user = getUserByEmail("idontexist@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});
