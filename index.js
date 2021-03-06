/**
 * @classdesc AsyncBuffer class. Used to cache multiple function calls and
 * run them after specified timeout.
 * 
 * @class module:buffer~AsyncBuffer
 */
function AsyncBuffer(){
    this.waiting = false;
    this.callbacks = [];
    this.namedCallbacks = {};
    this.lastCallbacks = [];
    this.timeout = 100;
}

/**
 * Starts buffer timer. After that timer fires, all callbacks that are
 * in the queues will be executed.
 * 
 * @method module:buffer~AsyncBuffer#start
 * @private
 */
AsyncBuffer.prototype.start = function(){

    var self = this;

    if(!self.waiting){
        self.waiting = true;
        setTimeout(function(){

            // finish call be called manualy
            if(self.waiting){
                self.finish();
            }
        }, self.timeout);
    }
};


/**
 * If callback is function, calls it.
 * 
 * @method module:buffer~AsyncBuffer#resolveCallbacks
 * @private
 * @param {Function} callback
 */
function resolveCallback(callback){
    if(typeof callback === 'function'){
        callback();
    }
}

/**
 * Resolves all callbacks in given array.
 * 
 * @method module:buffer~AsyncBuffer#resolveCallbacks
 * @param {Function[]} callbacks - Array of callbacks
 */
function resolveCallbacks(callbacks){
    while(callbacks.length){
        resolveCallback(callbacks.shift());
    }
}

/**
 * Resolves all named callbacks.
 * 
 * @method module:buffer~AsyncBuffer#resolveNamedCallbacks
 * @private
 */
AsyncBuffer.prototype.resolveNamedCallbacks = function(){
    var self = this;

    for(var id in self.namedCallbacks){
        var namedCallback = self.namedCallbacks[id];
        self.namedCallbacks[id] = undefined;
        resolveCallback(namedCallback);
   }
};

/**
 * Resolves all main callbacks.
 * 
 * @method module:buffer~AsyncBuffer#resolveMainCallbacks
 * @private
 */
AsyncBuffer.prototype.resolveMainCallbacks = function(){
    var self = this;
    resolveCallbacks(self.callbacks);
};

/**
 * Resolves all callbacks that should be resolved last.
 * 
 * @method module:buffer~AsyncBuffer#resolveLastCallbacks
 * @private
 */
AsyncBuffer.prototype.resolveLastCallbacks = function(){
    var self = this;
    resolveCallbacks(self.lastCallbacks);
};

/**
 * Resolves all callbacks.
 * 
 * @method module:buffer~AsyncBuffer#finish
 * @private
 */

AsyncBuffer.prototype.finish = function(){
    var self = this;

    self.waiting = false;

    self.resolveNamedCallbacks();
    self.resolveMainCallbacks();
    self.resolveLastCallbacks();
};

/**
 * Resolves while buffer is not empty, but not more than 10 times.
 * 
 * @method module:buffer~AsyncBuffer#finishAll
 * @returns {Number} How many times 'finish' was called
 */
AsyncBuffer.prototype.finishAll = function(){
    var self = this;
    var counter = 0;

    while(!self.isEmpty() && counter<10){
        self.finish();
        counter++;
    }

    return counter;
};

/**
 * Adds callback to main queue and starts timer.
 * 
 * @method module:buffer~AsyncBuffer#onFinish 
 * @param {Function} callback - Callback that will be added to queue
 */
AsyncBuffer.prototype.onFinish = function(callback){
    var self = this;
    self.start();
    self.callbacks.push(callback);
};

/**
 * Adds named callback to queue and starts timer. Only last callback
 * with given id will be called. This function is particularly useful
 * when we need to eliminate multiple redraws caused by several changes
 * over a small period of time.
 * 
 * @method module:buffer~AsyncBuffer#onLastFinish
 * @param {String} id - ID of callback. If another callback with the
 * same id was already added after last finish() call, it will be
 * replace with the new one.
 * @param {Function} callback - Callback that will be added to queue
 */
AsyncBuffer.prototype.onLastFinish = function(id, callback){
    var self = this;
    self.start();
    self.namedCallbacks[id] = callback;
};

/**
 * Adds callback to queue that resolves after all other callbacks were
 * called and starts timer.
 * 
 * @method module:buffer~AsyncBuffer#afterFinish
 * @param {Function} callback - Callback that will be added to queue.
 */
AsyncBuffer.prototype.afterFinish = function(callback){
    var self = this;
    self.start();
    self.lastCallbacks.push(callback);
};

/**
 * Returns whether or not there is a callback in the named callbacks
 * queue for given ID (see onLastFinish() method).
 * 
 * @method module:buffer~AsyncBuffer#has
 * @param {String} id - ID of callback
 * @return {Boolean} - Is in the queue?
 */
AsyncBuffer.prototype.has = function(id){
    var self = this;
    return self.namedCallbacks[id] !== undefined;
};

/**
 * Sets timeout after which buffer should fire.
 * 
 * @method module:buffer~AsyncBuffer#setTimeout
 * @param {Number} timeout - New timeout value
 */
AsyncBuffer.prototype.setTimeout = function(timeout){
    var self = this;
    if(isNaN(timeout)){
        throw new Error('AsyncBuffer timeout should be a number');
    }

    self.timeout = timeout;
};


/**
 * Returns current buffer timeout.
 * 
 * @method module:buffer~AsyncBuffer#getTimeout
 * @returns {Number} Current timeout value
 */
AsyncBuffer.prototype.getTimeout = function(){
    var self = this;
    return self.timeout;
};

/**
 * Check if buffer has something in at least one of its queues.
 * 
 * @method module:buffer~AsyncBuffer#isEmpty
 * @returns {Boolean} Empty or not?
 */
AsyncBuffer.prototype.isEmpty = function(){
    var self = this;

    for(var id in self.namedCallbacks){
        if(self.has(id)){
            return false;
        }
    }

    var callbacks = self.callbacks.length === 0;
    var lastCallbacks = self.lastCallbacks.length === 0;

    return callbacks && lastCallbacks;
};

if (typeof define === 'function' && define.amd) {
    define("async-buffer", [], {
        AsyncBuffer: AsyncBuffer
    });
} else if ('undefined' !== typeof exports && 'undefined' !== typeof module) {
    module.exports.AsyncBuffer = AsyncBuffer;
} else {
    window.AsyncBuffer = AsyncBuffer;
}

