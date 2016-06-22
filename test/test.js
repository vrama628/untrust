'use strict';

const expect = require('chai').expect,
      sinon = require('sinon');

const untrust = require('..');

function check(done, test) {
  try {
    test();
    done();
  } catch (e) {
    done(e);
  }
}

describe('untrust', function() {
  describe('#run()', function() {
    it("throws an error when not called with two string arguments.", function() {
      expect(() => untrust.run()).to.throw(Error);
      expect(() => untrust.run('var foo = 0;')).to.throw(Error);
    });

    it("returns a DownwardConnection when called with two string arguments.", function() {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_empty.js'));
      expect(dc).to.be.an.instanceof(untrust.DownwardConnection);
    });

    it("can take a third parameter which it passes as the third argument to the DSL.", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_arg.js'), {foo: 'bar'});
      dc.on('message', arg => check(done, () => {
        expect(arg.foo).to.equal('bar');
      }));
    });
  });

  describe('#Connection instance', function () {
    it("emits 'message' when #send() is called on the corresponding Connection object.", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_send.js'));
      dc.on('message', () => done());
    });

    it("passes the argument that was passed to the corresponding #send() when it emits 'message'", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_send.js'));
      dc.on('message', foo => check(done, () => {
        expect(foo).to.equal('foo');
      }));
    });

    it("emits 'request' when #request() is called on the corresponding Connection object.", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_request.js'));
      dc.on('request', () => done());
    });

    it("passes the argument that was passed to the corresponding #request() when it emits 'request'.", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_request.js'));
      dc.on('request', factors => check(done, () => {
        expect(factors.x).to.equal(2);
        expect(factors.y).to.equal(3);
      }));
    });

    it("passes a second argument (a respond function) to the 'request' event.", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_request.js'));
      dc.on('request', (factors, respond) => check(done, () => {
        expect(respond).to.be.a('function');
      }));
    });

    it("causes the Promise returned by the #request() call to be resolved when the respond function is called.", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_request.js'));
      dc.on('request', (factors, respond) => respond(factors.x * factors.y));
      dc.on('message', () => done());
    });

    it("causes the Promise returned by the #request() call to be resolved with the value passed into the respond function.", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_request.js'));
      dc.on('request', (factors, respond) => respond(factors.x * factors.y));
      dc.on('message', response => check(done, () => {
        expect(response).to.equal(6);
      }));
    });

    describe('#send()', function() {
      it("causes the corresponding Connection object to emit a 'message' event.", function(done) {
        let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_receiveReply.js'));
        dc.on('message', () => done());
        dc.send('fooBar');
      });

      it("causes the corresponding 'message' event to be emitted with the same argument as passed in.", function(done) {
        let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_receiveReply.js'));
        dc.on('message', fooBar => check(done, () => {
          expect(fooBar).to.equal('fooBar');
        }));
        dc.send('fooBar');
      });
    });

    describe('#message()', function() {
      it("is an alias for the #send() function.", function() {
        let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_empty.js'));
        expect(dc.message.toString()).to.equal(dc.send.toString());
      });
    });

    describe('#request()', function() {
      it("causes the corresponding Connection object to emit a 'request' event.", function(done) {
        let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_response.js'));
        dc.on('message', () => done());
        dc.request({x: 4, y: 5})
      });

      it("causes the corresponding 'request' event to be emitted with the argument that was passed in.", function(done) {
        let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_response.js'));
        dc.on('message', requested => check(done, () => {
          expect(requested.x).to.equal(4);
          expect(requested.y).to.equal(5);
        }));
        dc.request({x: 4, y: 5});
      });

      it("appends a function to the argument list of the triggered 'request' event.", function(done) {
        let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_response.js'));
        dc.on('message', requested => check(done, () => {
          expect(requested.isFunction).to.be.true;
        }));
        dc.request({x: 4, y: 5});
      });

      it("returns a Promise.", function() {
        let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_response.js'));
        let multPromise = dc.request({x: 4, y: 5});
        expect(multPromise).to.be.an.instanceof(Promise);
      });

      it("resolves the returned Promise to the value passed into the corresponding respond function.", function(done) {
        let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_response.js'));
        let multPromise = dc.request({x: 4, y: 5});
        multPromise.then(product => check(done, () => {
          expect(product).to.equal(20);
        }));
      });

      it("resolves Promises with responses to the respective requests, even when multiple requests happen simultaneously.", function(done) {
        let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_response.js'));
        let multPromises = new Array(1000);
        for (let i = 0; i < multPromises.length; i++) {
          multPromises[i] = dc.request({x: 2, y: i});
        }
        Promise.all(multPromises).then(mults => check(done, () => {
          mults.map((val, index) => expect(val).to.equal(2 * index));
        }));
      });
    });    
  });

  describe('#DownwardConnection instance', function() {
    it('is a Connection', function() {
      expect(untrust.DownwardConnection.prototype).to.be.an.instanceof(untrust.Connection);
    });

    it("emits 'exit' if the running code decides to exit.", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_exit.js'));
      dc.on('exit', () => done());
    });

    it("emits 'exit' if the running code is killed.", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_loop.js'));
      dc.on('exit', () => done());
      process.kill(dc.pid);
    });

    it("emits an 'error' when the DSL throws an unhandled error.", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_error.js'));
      dc.on('error', () => done());
    });

    it("passes the error message as the 'message' attribute of the argument to a DSL-based 'error' event.", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_error.js'));
      dc.on('error', e => check(done, () => {
        expect(e.message).to.equal('foo');
      }));
    });

    it("passes a value in the 'stack' attribute of the argument to a DSL-based 'error' event.", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_error.js'));
      dc.on('error', e => check(done, () => {
        expect(e.stack).to.be.ok;
      }));
    });

    it("emits an 'error' when the untrusted code throws an unhandled error.", function(done) {
      let dc = untrust.run('throw new Error("bar")', require.resolve('./res/dsl_empty.js'));
      dc.on('error', () => done());
    });

    it("passes the error message as the 'message' attribute of the argument to an untrusted-code-based 'error' event.", function(done) {
      let dc = untrust.run('throw new Error("bar")', require.resolve('./res/dsl_empty.js'));
      dc.on('error', e => check(done, () => {
        expect(e.message).to.equal('bar');
      }));
    });

    it("passes a value in the 'stack' attribute of the argument to an untrusted-code-based 'error' event.", function(done) {
      let dc = untrust.run('throw new Error("bar")', require.resolve('./res/dsl_empty.js'));
      dc.on('error', e => check(done, () => {
        expect(e.stack).to.be.ok;
      }));
    });

    describe('#kill()', function() {
      it("throws an error if the DSL and untrusted code have already completed.", function(done) {
        let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_exit.js'));
        dc.on('exit', () => check(done, () => {
          expect(dc.kill).to.throw(Error);
        }));
      });

      it("kills the execution of the DSL and/or untrusted code when possible.", function(done) {
        let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_exit.js')),
            spy = sinon.spy();
        dc.on('message', spy);
        setTimeout(() => check(done, () => {
          expect(spy.called).to.be.false;
        }), 500);
      });
    });

    describe('#pid', function() {
      it("contains the process identifier of the process the untrusted code is being run in.", function() {
        let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_loop.js')),
            spy = sinon.spy();
        let pid = dc.pid;
        process.kill(pid);
        expect(() => process.kill(pid)).to.throw(Error);
      });
    });

    describe('#alive', function() {
      it("is true before the code has exited", function() {
        let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_loop.js'));
        expect(dc.alive).to.be.true;
      });

      it("is false after the code has exited", function(done) {
        let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_loop.js'));
        dc.on('exit', () => check(done, () => {
          expect(dc.alive).to.be.false;
        }));
        process.kill(dc.pid);
      });
    })
  });

  describe('#UpwardConnection instance', function() {
    it("is a Connection", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_instances.js'));
      dc.on('message', instances => check(done, () => {
        expect(instances.conn).to.be.true;
      }));
    })

    describe('#error()', function() {
      it("causes the corresponding DownwardConnection object to emit an 'error' event.", function(done) {
        let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_errorFcn.js'));
        dc.on('error', () => done());
      });

      it("causes the 'error' event to be emitted with the argument it was called on.", function(done) {
        let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_errorFcn.js'));
        dc.on('error', err => check(done, () => {
          expect(err.message).to.equal('foo');
        }));
      });
    });
  })

  describe('worker.js', function() {
    it("passes an UpwardConnection as the first argument to the DSL.", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_instances.js'));
      dc.on('message', instances => check(done, () => {
        expect(instances.uc).to.be.true;
      }));
    });

    it("passes a Promise as the second argument to the DSL.", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_instances.js'));
      dc.on('message', instances => check(done, () => {
        expect(instances.result).to.be.true;
      }));
    });

    it("resolves the Promise in the second argument to the untrusted code's resulting global.", function(done) {
      let dc = untrust.run('var foo = 0;', require.resolve('./res/dsl_result.js'));
      dc.on('message', obj => check(done, () => {
        expect(obj.foo).to.equal(0);
      }));
    });

    context("the DSL function returns an object.", function() {
      it("runs the untrusted code with the DSL's return value as the global.", function(done) {
        let dc = untrust.run('var baz = foo + "ry";', require.resolve('./res/dsl_object.js'));
        dc.on('message', obj => check(done, () => {
          expect(obj.baz).to.equal('barry');
        }));
      });
    });

    context("the DSL function returns a Promise of an object.", function() {
      it("runs the untrusted code with the DSL's resolution's value as the global.", function(done) {
        let dc = untrust.run('var baz = foo + "ry";', require.resolve('./res/dsl_promise.js'));
        dc.on('message', obj => check(done, () => {
          expect(obj.baz).to.equal('starry');
        }));
      });
    });
  })
});