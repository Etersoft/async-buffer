/**
 * @classdesc Buffer class. Used to cache multiple function calls and
 * run them after specified timeout.
 * 
 * @class module:buffer~Buffer
 */
function Buffer(){
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
 * @method module:buffer~Buffer#start
 * @private
 */
Buffer.prototype.start = function(){

    var $$ = this;

    if(!$$.waiting){
        $$.waiting = true;
        setTimeout(function(){

            // finish call be called manualy
            if($$.waiting){
                $$.finish();
            }
        }, $$.timeout);
    }
};


/**
 * If callback is function, calls it.
 * 
 * @method module:buffer~Buffer#resolveCallbacks
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
 * @method module:buffer~Buffer#resolveCallbacks
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
 * @method module:buffer~Buffer#resolveNamedCallbacks
 * @private
 */
Buffer.prototype.resolveNamedCallbacks = function(){
    var $$ = this;

    for(var id in $$.namedCallbacks){
        var namedCallback = $$.namedCallbacks[id];
        $$.namedCallbacks[id] = undefined;
        resolveCallback(namedCallback);
   }
};

/**
 * Resolves all main callbacks.
 * 
 * @method module:buffer~Buffer#resolveMainCallbacks
 * @private
 */
Buffer.prototype.resolveMainCallbacks = function(){
    var $$ = this;
    resolveCallbacks($$.callbacks);
};

/**
 * Resolves all callbacks that should be resolved last.
 * 
 * @method module:buffer~Buffer#resolveLastCallbacks
 * @private
 */
Buffer.prototype.resolveLastCallbacks = function(){
    var $$ = this;
    resolveCallbacks($$.lastCallbacks);
};

/**
 * Resolves all callbacks.
 * 
 * @method module:buffer~Buffer#finish
 * @private
 */

Buffer.prototype.finish = function(){
    var $$ = this;

    $$.waiting = false;

    $$.resolveNamedCallbacks();
    $$.resolveMainCallbacks();
    $$.resolveLastCallbacks();
};

/**
 * Resolves while buffer is not empty, but not more than 10 times.
 * 
 * @method module:buffer~Buffer#finishAll
 * @returns {Number} How many times 'finish' was called
 */
Buffer.prototype.finishAll = function(){
    var $$ = this;
    var counter = 0;

    while(!$$.isEmpty() && counter<10){
        $$.finish();
        counter++;
    }

    return counter;
};

/**
 * Adds callback to main queue and starts timer.
 * 
 * @method module:buffer~Buffer#onFinish 
 * @param {Function} callback - Callback that will be added to queue
 */
Buffer.prototype.onFinish = function(callback){
    var $$ = this;
    $$.start();
    $$.callbacks.push(callback);
};

/**
 * Adds named callback to queue and starts timer. Only last callback
 * with given id will be called. This function is particularly useful
 * when we need to eliminate multiple redraws caused by several changes
 * over a small period of time.
 * 
 * @method module:buffer~Buffer#onLastFinish
 * @param {String} id - ID of callback. If another callback with the
 * same id was already added after last finish() call, it will be
 * replace with the new one.
 * @param {Function} callback - Callback that will be added to queue
 */
Buffer.prototype.onLastFinish = function(id, callback){
    var $$ = this;
    $$.start();
    $$.namedCallbacks[id] = callback;
};

/**
 * Adds callback to queue that resolves after all other callbacks were
 * called and starts timer.
 * 
 * @method module:buffer~Buffer#afterFinish
 * @param {Function} callback - Callback that will be added to queue.
 */
Buffer.prototype.afterFinish = function(callback){
    var $$ = this;
    $$.start();
    $$.lastCallbacks.push(callback);
};

/**
 * Returns whether or not there is a callback in the named callbacks
 * queue for given ID (see onLastFinish() method).
 * 
 * @method module:buffer~Buffer#has
 * @param {String} id - ID of callback
 * @return {Boolean} - Is in the queue?
 */
Buffer.prototype.has = function(id){
    var $$ = this;
    return $$.namedCallbacks[id] !== undefined;
};

/**
 * Sets timeout after which buffer should fire.
 * 
 * @method module:buffer~Buffer#setTimeout
 * @param {Number} timeout - New timeout value
 */
Buffer.prototype.setTimeout = function(timeout){
    var $$ = this;
    if(isNaN(timeout)){
        throw new Error('Buffer timeout should be a number');
    }

    $$.timeout = timeout;
};


/**
 * Returns current buffer timeout.
 * 
 * @method module:buffer~Buffer#getTimeout
 * @returns {Number} Current timeout value
 */
Buffer.prototype.getTimeout = function(){
    var $$ = this;
    return $$.timeout;
};

/**
 * Check if buffer has something in at least one of its queues.
 * 
 * @method module:buffer~Buffer#isEmpty
 * @returns {Boolean} Empty or not?
 */
Buffer.prototype.isEmpty = function(){
    var $$ = this;

    for(var id in $$.namedCallbacks){
        if($$.has(id)){
            return false;
        }
    }

    var callbacks = $$.callbacks.length === 0;
    var lastCallbacks = $$.lastCallbacks.length === 0;

    return callbacks && lastCallbacks;
};

if (typeof define === 'function' && define.amd) {
    define("Buffer", [], function () { return Buffer; });
} else if ('undefined' !== typeof exports && 'undefined' !== typeof module) {
    module.exports = Buffer;
} else {
    window.Buffer = Buffer;
}

