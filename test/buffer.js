
var assert = require("chai").assert;

var Buffer = require("../buffer");

var MultipleDone = require("./utils").MultipleDone;

describe("Buffer", ()=>{

    it('timeout. Default', function(){
        var buffer = new Buffer();
        assert.equal(buffer.getTimeout(), 100);
    });

    it('timeout. Set', function(){
        var buffer = new Buffer();
        buffer.setTimeout(500);
        assert.equal(buffer.getTimeout(), 500);
    });

    it('has. single', function(){
        var buffer = new Buffer();

        buffer.onLastFinish('single', function(){});

        assert.ok(buffer.has('single'));
        assert.ok(!buffer.has('not-have'));
    });

    it('has. multi', function(){
        var buffer = new Buffer();

        buffer.onLastFinish('one', function(){});
        buffer.onLastFinish('two', function(){});
        buffer.onLastFinish('three', function(){});

        assert.ok(buffer.has('one'));
        assert.ok(buffer.has('two'));
        assert.ok(buffer.has('three'));

        assert.ok(!buffer.has('not-have'));
    });

    it('calls back', function(done){

        var buffer = new Buffer();

        buffer.onFinish(function(){
            assert.ok(true);
            done();
        });
    });

    it('calls all back', function(done){

        var buffer = new Buffer();

        var m = new MultipleDone(3);

        buffer.onFinish(function(){
            assert.ok(true);
            m.maybeDone(done);
        });
        buffer.onFinish(function(){
            assert.ok(true);
            m.maybeDone(done);
        });
        buffer.onFinish(function(){
            assert.ok(true);
            m.maybeDone(done);
        });
    });

    it('calls named callback', function(done){

        var buffer = new Buffer();

        buffer.onLastFinish('test', function(){
            assert.ok(true);
            done();
        });
    });

    it('calls only last named callback', function(done){

        var buffer = new Buffer();

        buffer.onLastFinish('test', function(){
            assert.ok(false);
        });
        buffer.onLastFinish('test', function(){
            assert.ok(false);
        });
        buffer.onLastFinish('test', function(){
            assert.ok(true);
            done();
        });
    });

    it('calls last callback', function(done){
        var buffer = new Buffer();
        buffer.afterFinish(function(){
            assert.ok(true);
            done();
        });
    });

    it('calls all last callback', function(done){
        var buffer = new Buffer();

        var m = new MultipleDone(3);

        buffer.afterFinish(function(){
            assert.ok(true);
            m.maybeDone(done);
        });
        buffer.afterFinish(function(){
            assert.ok(true);
            m.maybeDone(done);
        });
        buffer.afterFinish(function(){
            assert.ok(true);
            m.maybeDone(done);
        });
    });

    it('calls when timeout is 0', function(done){
        var buffer = new Buffer();

        var m = new MultipleDone(3);

        buffer.setTimeout(0);

        buffer.onFinish(function(){
            assert.ok(true);
            m.maybeDone(done);
        });

        buffer.onLastFinish('test', function(){
            assert.ok(true);
            m.maybeDone(done);
        });

        buffer.afterFinish(function(){
            assert.ok(true);
            m.maybeDone(done);
        });
    });

    it('calls multiple named callbacks', function(done){

        var buffer = new Buffer();

        var m = new MultipleDone(3);

        buffer.onLastFinish('test1', function(){
            assert.ok(true);
            m.maybeDone(done);
        });
        buffer.onLastFinish('test2', function(){
            assert.ok(true);
            m.maybeDone(done);
        });
        buffer.onLastFinish('test3', function(){
            assert.ok(true);
            m.maybeDone(done);
        });
    });

    it('calls unnamed, named and last callbacks', function(done){

        var buffer = new Buffer();

        var m = new MultipleDone(5);

        buffer.afterFinish(function(){
            assert.ok(true);
            m.maybeDone(done);
        });
        buffer.onFinish(function(){
            assert.ok(true);
            m.maybeDone(done);
        });
        buffer.onFinish(function(){
            assert.ok(true);
            m.maybeDone(done);
        });
        buffer.onLastFinish('test1', function(){
            assert.ok(true);
            m.maybeDone(done);
        });
        buffer.onLastFinish('test2', function(){
            assert.ok(true);
            m.maybeDone(done);
        });
    });

    it('handles recursive callbacks', function(done){

        var buffer = new Buffer();

        var m = new MultipleDone(3);

        buffer.onFinish(function(){
            assert.ok(true);
            m.maybeDone(done);
            buffer.onFinish(function(){
                assert.ok(true);
                m.maybeDone(done);
                buffer.onFinish(function(){
                    assert.ok(true);
                    m.maybeDone(done);
                });
            });
        });
    });

    it('handles recursive named callbacks', function(done){

        var buffer = new Buffer();

        var m = new MultipleDone(3);

        buffer.onLastFinish('test', function(){
            assert.ok(true);
            m.maybeDone(done);
            buffer.onLastFinish('test', function(){
                assert.ok(true);
                m.maybeDone(done);
                buffer.onLastFinish('test', function(){
                    assert.ok(true);
                    m.maybeDone(done);
                });
            });
        });
    });

    it('handles multiple recursive callbacks that overwrite each other', function(done){

        var buffer = new Buffer();

        var m = new MultipleDone(2);

        // only this two should be called
        buffer.onLastFinish('test1', function(){
            assert.ok(true);
            m.maybeDone(done);
            buffer.onLastFinish('test2', function(){
                assert.ok(true);
                m.maybeDone(done);
            });
        });

        buffer.onLastFinish('test2', function(){
            assert.ok(false);
            buffer.onLastFinish('test1', function(){
                assert.ok(false);
            });
        });
    });

    it('calls unnamed callbacks in order they are given', function(done){

        var buffer = new Buffer();

        var i = 0;

        buffer.onFinish(function(){
            assert.equal(i, 0);
            i++;
        });
        buffer.onFinish(function(){
            assert.equal(i, 1);
            i++;
        });
        buffer.onFinish(function(){
            assert.equal(i, 2);
            i++;

            done();
        });
    });

    it('calls last callbacks in order they are given', function(done){

        var buffer = new Buffer();

        var i = 0;

        buffer.afterFinish(function(){
            assert.equal(i, 0);
            i++;
        });
        buffer.afterFinish(function(){
            assert.equal(i, 1);
            i++;
        });
        buffer.afterFinish(function(){
            assert.equal(i, 2);
            i++;

            done();
        });
    });

    it('calls named callbacks before unnamed', function(done){

        var buffer = new Buffer();

        var i = 0; // counter of order

        buffer.onFinish(function(){
            assert.equal(i, 2);
            i++;

            done();
        });
        buffer.onLastFinish('test1', function(){
            // we cant guarantee order in named callbacks
            assert.ok(true);
            i++;
        });
        buffer.onLastFinish('test2', function(){
            assert.ok(true);
            i++;
        });
    });

    it('calls last callbacks last', function(done){
        var i = 0;

        var buffer = new Buffer();

        buffer.afterFinish(function(){
            assert.equal(i, 3);

            done();
        });
        buffer.onFinish(function(){
            assert.ok(true);
            i++;
        });
        buffer.onLastFinish('test1', function(){
            // we cant guarantee order in named callbacks
            assert.ok(true);
            i++;
        });
        buffer.onLastFinish('test2', function(){
            assert.ok(true);
            i++;
        });

    });

    it('handles multiple recursive mixed callbacks', function(done){

        var buffer = new Buffer();

        var m = new MultipleDone(5);

        buffer.onFinish(function(){
            assert.ok(true);
            m.maybeDone(done);
            buffer.onLastFinish('test', function(){
                assert.ok(true);
                m.maybeDone(done);
                buffer.onFinish(function(){
                    assert.ok(true);
                    m.maybeDone(done);
                });
            });
        });

        buffer.onLastFinish('test', function(){
            assert.ok(true);
            m.maybeDone(done);
            buffer.onFinish(function(){
                assert.ok(true);
                m.maybeDone(done);
            });
        });
    });
});
