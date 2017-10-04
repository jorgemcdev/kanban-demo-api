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
import List from './../models/model-list';

const should = chai.should();
chai.use(chaiHttp);

// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Token to protected routes
let myToken = '';
let decodedToken;
let myId;
let myBoard;

describe('> ------- List Test ------- <', () => {
  /**
    * @desc Empty Board, User and List
  */
  before((done) => {
    // connectToDB();
    Board.remove({}, (err) => {
      if (err) throw err;
    });
    User.remove({}, (err) => {
      if (err) throw err;
    });
    List.remove({}, (err) => {
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
          decodedToken = jwt.decode(myToken);
          myId = decodedToken._id;
          res.body.should.have.property('token');
          res.should.have.status(200);
          done();
        });
    });
  });
  /**
    * @desc Post a Board
  */
  describe('Post a Board ', (done) => {
    it('it should post a board', (done) => {
      const board = {
        name: 'My First Board',
        _user: myId
      };
      chai.request(server)
        .post('/api/board')
        .set('Authorization', `Bearer ${myToken}`)
        .send(board)
        .end((err, res) => {
          myBoard = res.body.board._id;
          logger.info('----------------------------------------');
          logger.info('ID: ', myId);
          console.log('Token: ', myToken);
          logger.info('Board:', myBoard);
          logger.info('----------------------------------------');
          res.body.should.be.a('object');
          res.body.should.not.have.property('err');
          res.body.should.have.property('success').eql(true);
          res.should.have.status(200);
          done();
        });
    });
  });

 /**
    * @desc Post a List
  */
  describe('Post a List ', (done) => {
    it('it should post a list', (done) => {
      const data = {
        name: 'My First List',
        _board: myBoard
      };
      chai.request(server)
        .post('/api/list')
        .set('Authorization', `Bearer ${myToken}`)
        .send(data)
        .end((err, res) => {
          res.body.list.should.be.a('object');
          res.body.should.not.have.property('error');
          res.body.should.have.property('list');
          res.body.should.have.property('success').eql(true);
          res.should.have.status(200);
          done();
        });
    });
  });
  /**
    * @desc Get All Lists
  */
  describe('Post a List ', (done) => {
    it('it should post a list', (done) => {
      const data = {
        _board: myBoard
      };
      chai.request(server)
        .post('/api/lists')
        .set('Authorization', `Bearer ${myToken}`)
        .send(data)
        .end((err, res) => {
          res.body.lists.should.be.a('array');
          res.body.should.not.have.property('error');
          res.body.should.have.property('lists');
          res.body.should.have.property('success').eql(true);          
          res.should.have.status(200);
          done();
        });
    });
  });
  /**
    * @desc LIST by ID
  */
  describe('List a List Board by ID', (done) => {
    it('it should get a board object by ID', (done) => {
      const data = new List({
        name: 'My other list'
      });
      data.save((err, list) => {
        chai.request(server)
        .post(`/api/list/${list.id}`)
        .set('Authorization', `Bearer ${myToken}`)
        .send({ _board: myBoard })
        .end((err, res) => {
          res.body.should.not.have.property('error');
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
      const data = new List({
        name: 'Original List Name',
        _board: myBoard
      });
      data.save((err, list) => {
        chai.request(server)
        .put(`/api/list/${list.id}`)
        .set('Authorization', `Bearer ${myToken}`)
        .send({
          name: 'Original List updated',
          _board: myBoard
        })
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
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
  describe('Delete List by ID', (done) => {
    it('it should delete List by ID', (done) => {
      const data = new List({
        name: 'My other list to delete',
        _board: myBoard
      });
      data.save((err, list) => {
        chai.request(server)
        .delete(`/api/list/${list.id}`)
        .set('Authorization', `Bearer ${myToken}`)
        .end((err, res) => {
          res.body.should.not.have.property('error');
          res.body.should.have.property('success').eql(true);          
          res.should.have.status(200);
          done();
        });
      });
    });
  });
  // end TEST
});
