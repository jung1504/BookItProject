// Imports the index.js file to be tested.
const server = require('../index.js'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });

  // ===========================================================================
  // TO-DO: Part A Login unit test case
  // it('positive : /login', done => {
  //   chai
  //     .request(server)
  //     .post('/login')
  //     .send({id: 5, name: 'John Doe', dob: '2020-02-20'})
  //     .end((err, res) => {
  //       expect(res).to.have.status(200);
  //       expect(res.body.message).to.equals('Success');
  //       done();
  //     });
  // });

  // REGISTER ENDPOINT TESTING
  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({email: 'testEmail@colorado.edu', password: 'testPassword'})
      .end((err, res) => {
        expect(res).to.have.status(201);
        // expect(res.body.message).to.equals('test1');
        done();
      });
  });
});

it('Negative : /add_user. Checking if user already exists in database.', done => {
  chai
    .request(server)
    .post('/register')
    .send({email: 'testEmail25@colorado.edu', password: 'testPassword25'})
    .end((err, res) => {
      expect(res).to.have.status(401);
      // expect(res.body.message).to.equals('Invalid input');
      done();
    });
});