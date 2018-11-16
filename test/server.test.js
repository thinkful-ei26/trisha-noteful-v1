'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Reality check', () => {
  
  it('true should be true', () => {
    expect(true).to.be.true;
  });

  it('2+2 should equal 4', () => {
    expect(2 + 2).to.eq(4);
  });

});

describe('Express static', function () {

  it('GET request "/" should return the index page', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });

});

describe('404 handler', function () {

  it('should respond with 404 when given a bad path', function () {
    return chai.request(app)
      .get('/DOES/NOT/EXIST')
      .then(res => {
        expect(res).to.have.status(404);
      });
  });

});

describe('GET /api/notes', () => {

  it('should return 10 notes on start up', () => {
    return chai.request(app)
      .get('/api/notes')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(10);
      });
  });

  it('should return valid keys', () => {
    return chai.request(app)
      .get('/api/notes')
      .then((res) => {
        const expectedKeys = ['id', 'title', 'content'];
        res.body.forEach((note) => {
          expect(note).to.be.a('object');
          expect(note).to.include.keys(expectedKeys);
        });
      });
  });

  it('should return valid for a searchTerm', () => {
    return chai.request(app)
      .get('/api/notes?searchTerm=article')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(2);
        //console.log(res.body);
      });
  });

  it('should return valid for an INVALID searchTerm', () => {
    return chai.request(app)
      .get('/api/notes?searchTerm=article%20something%20notValid')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(0);
        console.log(res.body);
      });
  });

});


describe('GET /api/notes/:id', () => {
  it('should return correct note object with id, title and content for a given id', () => {
    return chai.request(app)
      .get('/api/notes/1005')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'title', 'content');
      });
  });
}); 

describe('GET /api/notes/:id', () => {
  it('should respond with a 404 for an invalid id ', () => {
    return chai.request(app)
      .get('/api/notes/DOESNOTEXIST')
      .then((res) => {
        expect(res).to.have.status(404);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('message');
      });
  });
}); 


describe('POST /api/notes', () => {

}); 


describe('PUT /api/notes/:id', () => {

}); 



describe('DELETE /api/notes/:id', () => {

}); 