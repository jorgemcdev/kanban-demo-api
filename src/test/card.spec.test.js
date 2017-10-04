/* global describe it beforeEach before after afterEach */
/* eslint no-unused-vars: 0 */
/* eslint no-shadow: 0 */
/* eslint no-console: 0 */

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
import Card from './../models/model-card';

const should = chai.should();
chai.use(chaiHttp);

// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Token to protected routes
let myToken;
let decodedToken;
let myId;
let myBoard;
let myList;
let myCard;

function logInfo(myId, myToken, myBoard, myList) {
  console.log('----------------------------------------');
  console.log('ID: ', myId);
  console.log('Token: ', myToken);
  console.log('Board:', myBoard);
  console.log('List:', myList);
  console.log('----------------------------------------');
}

describe('> ------- Card Test ------- <', () => {
  /**
    * @desc Empty Board, User, List, Card
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
    Card.remove({}, (err) => {
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
          console.log(myToken);
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
  describe('Post a Board', (done) => {
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
  describe('Post a List', (done) => {
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
          myList = res.body.list._id;
          res.body.should.be.a('object');
          res.body.should.not.have.property('error');
          res.body.should.have.property('list');
          res.body.should.have.property('success').eql(true);
          res.should.have.status(200);
          done();
        });
    });
  });
 /**
    * @desc Post a Card
  */
  describe('Post a Card', (done) => {
    it('it should post a list', (done) => {
      const data = {
        description: 'My First Card',
        _list: myList
      };
      chai.request(server)
        .post('/api/card')
        .set('Authorization', `Bearer ${myToken}`)
        .send(data)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.not.have.property('error');
          res.body.should.have.property('card');
          res.body.should.have.property('success').eql(true);
          res.should.have.status(200);
          done();
        });
    });
  });
 /**
    * @desc List all Cards
  */
  describe('Get All Cards From a List', (done) => {
    it('it should list all the Cards By List', (done) => {
      const data = {
        _list: myList
      };
      chai.request(server)
        .post('/api/cards')
        .set('Authorization', `Bearer ${myToken}`)
        .send(data)
        .end((err, res) => {
          res.body.cards.should.be.a('array');
          res.body.should.not.have.property('error');
          res.body.should.have.property('cards');
          res.body.should.have.property('success').eql(true);
          res.should.have.status(200);
          done();
        });
    });
  });

 /**
    * @desc List Card by ID
  */
  describe('Get Card by ID', (done) => {
    it('it should List a Card by ID + LIST ', (done) => {
      const data = new Card({
        description: 'My First Card',
        _list: myList
      });
      data.save((err, card) => {
        chai.request(server)
          .get(`/api/card/${card.id}`)
          .set('Authorization', `Bearer ${myToken}`)
          .end((err, res) => {
            res.body.card.should.be.a('object');
            res.body.should.not.have.property('error');
            res.body.should.have.property('card');
            res.body.should.have.property('success').eql(true);
            res.should.have.status(200);
            done();
          });
      });
    });

    it('it should List a Card by ID + LIST ', (done) => {
      chai.request(server)
        .get('/api/card/123456')
        .set('Authorization', `Bearer ${myToken}`)
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

  // end TEST
});
