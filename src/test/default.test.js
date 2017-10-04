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

const should = chai.should();
chai.use(chaiHttp);

// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

describe('Default Routes Test', () => {
  /* Before Hook */
  before((done) => {
    done();
  });

  describe('> ------- Default Routes Test ------- <', () => {
    it('it should get default home page ', (done) => {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('it should get test api end point home page', (done) => {
      chai.request(server)
        .get('/api/test')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});
