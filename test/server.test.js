'use strict';

const chai = require('chai');

const expect = chai.expect;

describe('Reality check', () => {
  
  it('true should be true', () => {
    expect(true).to.be.true;
  });

  it('2+2 should equal 4', () => {
    expect(2 + 2).to.eq(4);
  });

});
