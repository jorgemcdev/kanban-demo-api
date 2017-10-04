/* global describe it beforeEach before after afterEach */
/* eslint no-unused-vars: 0 */
/* eslint no-shadow: 0 */

// Import the dev-dependencies
import mongoose from 'mongoose';
import chai from 'chai';
import chaiHttp from 'chai-http';
import config from 'config';
import logger from 'winston';

import server from './../server';
import connectToDB from './../lib/db';

import User from './../models/model-user';

const should = chai.should();
chai.use(chaiHttp);

// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Token to protected routes
let myToken = '';

describe('> ------- User Test ------- <', () => {
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
    * @desc Add User to LOGIN to Protected Routes
  */
  describe('Add User and Login', (done) => {
    it('it should ADD a user', (done) => {
      const user = {
        name: 'Admin',
        email: 'admin@gmail.com',
        password: '123456'
      };
      chai.request(server)
        .post('/api/signup')
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('it should LOGIN a user and save the Token in myToken var', (done) => {
      const user = {
        email: 'admin@gmail.com',
        password: '123456'
      };
      chai.request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
          myToken = res.body.token;
          res.body.should.have.property('token');
          res.should.have.status(200);
          done();
        });
    });
  });
  /**
    * @desc POST One
  */
  describe('Post a User ', (done) => {
    it('it should post a user', (done) => {
      const user = {
        name: 'John Doe',
        email: 'johndoe@gmail.com',
        password: '123456'
      };
      chai.request(server)
        .post('/api/user')
        .set('Authorization', `Bearer ${myToken}`)
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.not.have.property('error');
          res.body.should.have.property('success').eql(true);
          done();
        });
    });
  });
  /**
    * @desc GET All
  */
  describe('List All Users', (done) => {
    it('it should get a boards array ', (done) => {
      chai.request(server)
        .get('/api/users')
        .set('Authorization', `Bearer ${myToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.users.should.be.a('array');
          res.body.should.have.property('users');
          res.body.should.not.have.property('errors');
          done();
        });
    });
    it('it should get a 404 ', (done) => {
      chai.request(server)
        .get('/api/users_wrong_route')
        .set('Authorization', `Bearer ${myToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
  /**
    * @desc GET by ID
  */
  describe('List a User by ID', (done) => {
    it('it should get a User by given ID', (done) => {
      const data = new User({
        name: 'Tommy',
        email: 'tommy@gmail.com',
        password: '123456'
      });
      data.save((err, user) => {
        chai.request(server)
        .get(`/api/user/${user.id}`)
        .set('Authorization', `Bearer ${myToken}`)        
        .end((err, res) => {
          res.should.have.status(200);
          res.body.user.should.be.a('object');
          res.body.should.not.have.property('errors');
          done();
        });
      });
    });
  });
  /**
    * @desc UPDATE by ID
  */
  describe('Update a User by ID', (done) => {
    it('it should UPDATE a User by the given id', (done) => {
      const data = new User({
        name: 'Jack',
        email: 'jack@gmail.com',
        password: '123456'
      });

      data.save((err, user) => {
        chai.request(server)
        .put(`/api/user/${user.id}`)
        .set('Authorization', `Bearer ${myToken}`)        
        .send({
          name: 'Mr Jack',
          email: 'jack_new_email@gmail.com'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.user.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.user.should.have.property('name').eql('Mr Jack');
          res.body.user.should.have.property('email').eql('jack_new_email@gmail.com');
          res.body.should.not.have.property('error');
          done();
        });
      });
    });

    it('it should NOT UPDATE a User given not existing id', (done) => {
      chai.request(server)
      .put('/api/user/wrong_id')
      .set('Authorization', `Bearer ${myToken}`)        
      .send({
        name: 'Mr Jack',
        email: 'jack_new_email@gmail.com'
      })
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.have.property('success').eql(false);
        res.body.should.have.property('error');
        done();
      });
    });
  });
  /**
    * @desc DELETE by ID
  */
  describe('Delete a User by ID', (done) => {
    it('it should DELETE a User by the given id', (done) => {
      const data = new User({
        name: 'Jane',
        email: 'jane@gmail.com',
        password: '123456'
      });
      data.save((err, user) => {
        chai.request(server)
        .delete(`/api/user/${user.id}`)
        .set('Authorization', `Bearer ${myToken}`)        
        .end((err, res) => {
          res.body.should.have.property('success').eql(true);
          res.body.should.not.have.property('error');
          res.should.have.status(200);
          done();
        });
      });
    });
    it('it should DELETE a User by the given id', (done) => {
      chai.request(server)
      .delete('/api/user/my_wrong_id')
      .set('Authorization', `Bearer ${myToken}`)
      .end((err, res) => {
        res.body.should.have.property('success').eql(false);
        res.body.should.have.property('error');
        res.should.have.status(403);
        done();
      });
    });    
  });
  // end TEST
});
