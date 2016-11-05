import { expect } from 'chai'

describe('example', function(){
    it('should work!', function(){
        expect(true).not.to.be.false
        expect(() => { throw new Error('error') }).to.throw(Error)
    })
})
