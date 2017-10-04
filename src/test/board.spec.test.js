/* global describe it beforeEach before after afterEach */
/* eslint no-unused-vars: 0 */
/* eslint no-shadow: 0 */

import mongoose from 'mongoose';
import chai from 'chai';
import chaiHttp from 'chai-http';
import config from 'config';
import logger from 'winston';
import jwt from 'jsonwebtoken';

import server from './../server';
import connectToDB from './../lib/db';

import Board from './../models/model-board';
import User from './../models/model-user';

const should = chai.should();
chai.use(chaiHttp);

// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Token to protected routes
let myToken = '';
let decodedToken;
let myId;

describe('> ------- Boards Test ------- <', () => {
  /**
    * @desc Empty Board and User
  */
  before((done) => {
    // connectToDB();
    Board.remove({}, (err) => {
      if (err) throw err;
    });
    User.remove({}, (err) => {
      if (err) throw err;
    });
    done();
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
          console.log('---------------------------->');
          console.log(myToken);
          console.log('<----------------------------');
          decodedToken = jwt.decode(myToken);
          myId = decodedToken._id;
          res.body.should.have.property('token');
          res.should.have.status(200);
          done();
        });
    });
  });
  /**
    * @desc Post a Board / UserId
  */
  describe('Post a Board -----------------', (done) => {
    it('it should post a board', (done) => {
      const board = {
        name: 'My First Board'
      };
      chai.request(server)
        .post('/api/board')
        .set('Authorization', `Bearer ${myToken}`)
        .send(board)
        .end((err, res) => {
          res.body.board.should.be.a('object');
          res.body.should.not.have.property('error');
          res.body.should.have.property('success').eql(true);
          res.should.have.status(200);
          done();
        });
    });
  });
  /**
    * @desc List All User Boards / UserId
  */
  describe('List All User Boards', (done) => {
    it('it should list all boards', (done) => {
      chai.request(server)
        .get('/api/boards')
        .set('Authorization', `Bearer ${myToken}`)
        .end((err, res) => {
          res.body.boards.should.be.a('array');
          res.body.should.have.property('boards');
          res.body.should.not.have.property('errors');
          res.should.have.status(200);
          done();
        });
    });
  });
  /**
    * @desc LIST by ID
  */
  describe('List Board by ID', (done) => {
    it('it should get a board object by ID', (done) => {
      const data = new Board({
        name: 'My Board to list by ID'
      });
      data.save((err, board) => {
        chai.request(server)
        .get(`/api/board/${board.id}`)
        .set('Authorization', `Bearer ${myToken}`)
        .end((err, res) => {
          res.should.have.status(200);          
          done();
        });
      });
    });
  });
  /**
    * @desc UPDATE by ID
  */
  describe('Update a Board by ID', (done) => {
    it('it should UPDATE a Board by the given id', (done) => {
      const data = new Board({
        name: 'Original Board'
      });
      data.save((err, board) => {
        chai.request(server)
        .put(`/api/board/${board.id}`)
        .set('Authorization', `Bearer ${myToken}`)
        .send({
          name: 'Original Board updated'
        })
        .end((err, res) => {
          res.body.should.have.property('success').eql(true);
          res.body.board.should.have.property('name').eql('Original Board updated');
          res.body.should.not.have.property('errors');
          res.should.have.status(200);
          done();
        });
      });
    });
  });
  /**
    * @desc DELETE by ID
  */
  describe('Delete a Board by ID', (done) => {
    it('it should DELETE a Board by the given id', (done) => {
      const data = new Board({
        name: 'Board to Delete'
      });
      data.save((err, board) => {
        chai.request(server)
        .delete(`/api/board/${board.id}`)
        .set('Authorization', `Bearer ${myToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.not.have.property('errors');
          done();
        });
      });
    });
  });
  // end TEST
});
