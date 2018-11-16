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
      .then( res => {
        expect(res).to.have.status(404);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('message');
      })
      .catch(err => err.response);
  });
}); 


describe('POST /api/notes', () => {
  it('should create and return a new item with location header when provided valid data', () => {
    const newNote = {
      title: 'new title',
      content: 'new content'
    };
    return chai
      .request(app)
      .post('/api/notes')
      .send(newNote)
      .then(res => {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'title', 'content');
        //test that the server assigned the id
        expect(res.body.id).to.not.equal(null);
        //console.log('POST res.body', res.body);
        expect(res.body).to.deep.equal(
          Object.assign(newNote, { id: res.body.id })
        );
      });
  });
}); 

describe('POST /api/notes', () => {
  it('should return object w/ message property "Missing title in request body" when missing "title" field', () => {
    const invalidNote = {
      something: true
    };
    return chai
      .request(app)
      .post('/api/notes')
      .send(invalidNote)
      .then( res => {
        expect(res).to.have.status(404);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('message');
        expect(res.body.message).to.eq('Missing `title` in request body');
      })
      .catch(err => err.response);
  });
}); 

describe('PUT /api/notes/:id', () => {
  it('should update and return a note object when given valid data', () => {
    const updateNote = {
      'content': 'content new',
      'title': 'new title'
    };

    return chai
      .request(app)
      .put('/api/notes/1001')
      .then(res => {
        updateNote.id = res.body.id;
        return chai
          .request(app)
          .put('/api/notes/1001')
          .send(updateNote);
      })
      .then(res => {
        expect(res).to.have.status(200);
        //console.log('PUT REQUEST this is the res.body',res.body);
        expect(res.body.id).to.eq(1001);
        expect(res.body.title).to.eq(updateNote.title);
        expect(res.body.content).to.eq(updateNote.content);
      });
  });
}); 

('PUT /api/notes/:id', () => {
  it('should respond with a 404 for an invalid id', () => {
    const updateNote = {
      'content': 'content new',
      'title': 'new title'
    };

    return chai
      .request(app)
      .put('/api/notes/INVALID/ENDPOINT')
      .send(updateNote)
      .then( res => {
        expect(res).to.have.status(404);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('message');
        expect(res.body.message).to.eq('Missing `title` in request body');
      })
      .catch(err => err.response);
  });
}); 

describe('DELETE /api/notes/:id', () => {
  it('should delete recipes on DELETE', () => {
    return chai
      .request(app) //delete a specific id
      .delete('/api/notes/1001')
      .then(res => {
        expect(res).to.have.status(204);
      });
  });
}); 