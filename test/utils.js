
function MultipleDone(n){
    this.n = n;
}

MultipleDone.prototype.maybeDone = function(done, n){
    if(n === undefined){
        n = 1;
    }

    this.n -= n;

    if(this.n <= 0){
        done();
    }
}

module.exports.MultipleDone = MultipleDone
