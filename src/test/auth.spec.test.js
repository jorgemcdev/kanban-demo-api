/* global describe it beforeEach before after afterEach */
/* eslint no-unused-vars: 0 */
/* eslint no-shadow: 0 */

// Import the dev-dependencies
import mongoose from 'mongoose';
import config from 'config';
import chai from 'chai';
import chaiHttp from 'chai-http';
import User from './../models/model-user';
import server from './../server';
import connectToDB from './../lib/db';

const should = chai.should();
chai.use(chaiHttp);

// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Token to protected routes
let myToken = '';

describe('> ------- Authentication Test ------- <', () => {
  /**
    * @desc Empty Database before each Test
  */
  before((done) => {
    User.remove({}, (err) => {
      if (err) throw err;
      done();
    });
  });
  /**
   * @desc Signup User
   */
  describe('Signup User', () => {
    it('it should signup a User ', (done) => {
      const data = {
        name: 'John Doe',
        email: 'johndoe@gmail.com',
        password: '123456'
      };
      chai.request(server)
        .post('/api/signup')
        .send(data)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.not.have.property('error').eql('This user already exists');
          res.body.should.have.property('message').eql('New user created');
          done();
        });
    });
    it('it should not Signup a existing User ', (done) => {
      const data = {
        name: 'John Doe',
        email: 'johndoe@gmail.com',
        password: '123456'
      };
      chai.request(server)
        .post('/api/signup')
        .send(data)
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('error').eql('User already exists');
          done();
        });
    });
  });
  /**
   * @desc Login User and Save Token to Protected Routes
   */
  describe('Login User and Save Token to Protected Routes', () => {
    // Test Login: Correct Login + Password
    it('it should SignIn a User ', (done) => {
      const data = {
        email: 'johndoe@gmail.com',
        password: '123456'
      };
      chai.request(server)
        .post('/api/login')
        .send(data)
        .end((err, res) => {
          myToken = res.body.token;
          res.body.should.property('message').eql('Login Success');
          res.body.should.have.property('token');
          res.body.should.not.have.property('error');
          res.should.have.status(200);
          done();
        });
    });
    // Test Login: Correct Login + Wrong USERNAME
    it('it should NOT SignIn with WRONG email ', (done) => {
      const data = {
        email: 'johndoe_wrong_email@gmail.com',
        password: '123456'
      };
      chai.request(server)
        .post('/api/login')
        .send(data)
        .end((err, res) => {
          res.body.should.property('error').eql('Not found');
          res.should.have.status(401);
          done();
        });
    });
    // Test Login: Correct Login + Wrong Password
    it('it should NOT SignIn with WRONG Password', (done) => {
      const data = {
        email: 'johndoe@gmail.com',
        password: 'wrong_password'
      };
      chai.request(server)
        .post('/api/login')
        .send(data)
        .end((err, res) => {
          res.body.should.property('error').eql('Incorrect details');
          res.should.have.status(401);
          done();
        });
    });
  });
  /**
   * @desc Test is User Exists before Signup
   */
  describe('Test is User Exists before Signup', () => {
    // Test if existing User
    it('it should get TRUE if Users Exists', (done) => {
      const data = {
        email: 'johndoe@gmail.com'
      };
      chai.request(server)
        .post('/api/user-exists')
        .send(data)
        .end((err, res) => {
          res.body.should.property('success').eql(true);
          res.should.have.status(200);
          done();
        });
    });
    it('it should show FALSE if Users do not Exists', (done) => {
      const data = {
        email: 'no_existing_user@gmail.com'
      };
      chai.request(server)
        .post('/api/user-exists')
        .send(data)
        .end((err, res) => {
          res.body.should.property('success').eql(false);
          res.should.have.status(200);
          done();
        });
    });
  });
  /**
   * @desc Password Change / Protected Route
   */
  describe('Password Change', () => {
    // Test if existing User
    it('it should change password', (done) => {
      const data = {
        email: 'johndoe@gmail.com',
        password: '123456',
        newpassword: '123456789'
      };
      chai.request(server)
        .post('/api/passwordchange')
        .set('Authorization', `Bearer ${myToken}`)
        .send(data)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    it('it should NOT change if Password fails', (done) => {
      const data = {
        email: 'johndoe@gmail.com',
        password: 'wrongpassword',
        newpassword: '123456789'
      };
      chai.request(server)
        .post('/api/passwordchange')
        .send(data)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it('it should NOT change if Users email fails', (done) => {
      const data = {
        email: 'johndoe_wrong_email@gmail.com',
        password: '123456789',
        newpassword: '12345678910'
      };
      chai.request(server)
        .post('/api/passwordchange')
        .send(data)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    //
  });
  /**
   * @desc Test Refresh Token
   */
  describe('Refresh Token Test', () => {
    // Test if existing User
    it('it should get a new token', (done) => {
      const data = {
        email: 'johndoe@gmail.com',
        password: '123456789'
      };
      chai.request(server)
        .post('/api/refresh-token')
        .set('Authorization', `Bearer ${myToken}`)
        .end((err, res) => {
          chai.request(server)
            .post('/api/refresh-token')
            .set('Authorization', `Bearer ${res.body.token}`)
            .end((err, res) => {
              res.body.should.property('token').not.eql(myToken);
              res.should.have.status(200);
              done();
            });
        });
    });
    //
  });
  //
}); // End Main Describe, add new tests on top of this
