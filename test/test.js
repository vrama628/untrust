'use strict';

const expect = require('chai').expect,
      sinon = require('sinon'),
      untrust = require('..');

describe('untrust', function() {
  describe('#run()', function() {
    it("throws an error when not called with two string arguments.", function() {
      expect(() => untrust.run()).to.throw(Error);
      expect(() => untrust.run('foo')).to.throw(Error);
    });

    it("returns a DownwardConnection when called with two string arguments.", function () {
      expect(untrust.run('foo', 'bar')).to.be.an.instanceof(DownwardConnection);
    });
  });

  describe('DownwardConnection.prototype', function() {
    it("emits 'exit' if the running code decides to exit.", function(done) {
      let dc = untrust.run('./res/dsl_exit.js', 'let foo = 0;');
      dc.on('exit', () => done());
    });

    it("emits 'exit' if the running code is killed.", function(done) {
      let dc = untrust.run('./res/dsl_loop.js', 'let foo = 0;');
      dc.on('exit', () => done());
      process.kill(dc.pid);
    });

    it("emits an 'error' when the DSL throws an unhandled error.", function(done) {
      let dc = untrust.run('./res/dsl_error.js', 'let foo = 0;');
      dc.on('error', () => done());
    });

    it("passes the error as an argument to an 'error' emitted by the DSL throwing one.", function(done) {
      let dc = untrust.run('./res/dsl_error.js', 'let foo = 0;');
      dc.on('error', e => {
        expect(e.message).to.equal('foo');
        done();
      });
    });

    it("emits an 'error' when the untrusted code throws an unhandled error.", function(done) {
      let dc = untrust.run('./res/dsl_empty.js', 'throw new Error("bar")');
      dc.on('error', () => done());
    });

    it("passes the error as an argument to an 'error' emitted by the untrusted code throwing one.", function(done) {
      let dc = untrust.run('./res/dsl_empty.js', 'throw new Error("bar")');
      dc.on('error', e => {
        expect(e.message).to.equal('bar');
        done();
      });
    });

    it("emits 'message' when #send() is called on the corresponding UpwardConnection object.", function(done) {
      let dc = untrust.run('./res/dsl_send.js', 'let foo = 0;');
      dc.on('message', () => done());
    });

    it("passes the arguments that were passed to the corresponding #send() when it emits 'message'", function(done) {
      let dc = untrust.run('./res/dsl_send.js', 'let foo = 0;');
      dc.on('message' (foo, bar, baz) => {
        expect(foo).to.equal('foo');
        expect(bar).to.equal('bar');
        expect(baz).to.equal('baz');
        done();
      });
    });

    describe('#kill()', function() {
      it("throws an error if the DSL and untrusted code have already completed.", function(done) {
        let dc = untrust.run('./res/dsl_exit.js', 'let foo = 0;');
        dc.on('exit', () => {
          expect(dc.kill).to.throw(Error);
        })
      });

      it("kills the execution of the DSL and/or untrusted code when possible.", function(done) {
        let dc = untrust.run('./res/dsl_exit.js', 'let foo = 0;'),
            spy = sinon.spy();
        dc.on('message', spy);
        setTimeout(() => {
          expect(spy.called).to.be.false;
          done();
        }, 500);
      });
    });

    describe('#pid', function() {
      it("contains the process identifier of the process the untrusted code is being run in.", function() {
        let dc = untrust.run('./res/dsl_loop.js', 'let foo = 0;'),
            spy = sinon.spy();
        let pid = dc.pid;
        process.kill(pid);
        expect(() => process.kill(pid)).to.throw.an.(Error);
      });
    });

    describe('#send()', function() {
      it("causes the corresponding UpwardConnection object to emit a 'message' event.", function(done) {
        let dc = untrust.run('./res/dsl_receiveReply.js', 'let foo = 0;');
        dc.on('message', () => done());
        dc.send('fooBar');
      });

      it("causes the corresponding 'message' event to be emitted with the arguments as passed in.", function(done) {
        let dc = untrust.run('./res/dsl_receiveReply.js', 'let foo = 0;');
        dc.on('message', (received, fooBar) => {
          expect(received).to.equal('received');
          expect(fooBar).to.equal('fooBar');
          done();
        });
        dc.send('fooBar');
      });
    });
  });

  describe('worker', function() {
    it("passes an UpwardConnection as the first argument to the DSL.", function(done) {
      let dc = untrust.run('./res/dsl_instances.js', 'let foo = 0;');
      dc.on('message', instances => {
        expect(instances.uc).to.be.true;
        done();
      });
    });

    it("passes a Promise as the second argument to the DSL.", function(done) {
      let dc = untrust.run('./res/dsl_instances.js', 'let foo = 0;');
      dc.on('message', instances => {
        expect(instances.result).to.be.true;
        done();
      });
    });

    it("resolves the Promise in the second argument to the untrusted code's resulting global.", function(done) {
      let dc = untrust.run('./res/dsl_result.js', 'let foo = 0;');
      dc.on('message', obj => {
        expect(obj.foo).to.equal(0);
        done();
      });
    });

    context("the DSL function returns an object.", function() {
      it("runs the untrusted code with the DSL's return value as the global.", function(done) {
        let dc = untrust.run('./res/dsl_object.js', 'let baz = foo + "ry";');
        dc.on('message', obj => {
          expect(obj.baz).to.be('barry');
          done();
        });
      });
    });

    context("the DSL function returns a Promise of an object.", function() {
      it("runs the untrusted code with the DSL's resolution's value as the global.", function(done) {
        let dc = untrust.run('./res/dsl_promise.js', 'let baz = foo + "ry";');
        dc.on('message', obj => {
          expect(obj.baz).to.be('starry');
          done();
        });
      });
    });
  })
});