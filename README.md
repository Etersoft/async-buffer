
## Async Buffer
Utility buffer used for caching and queuing your changes

## Example

```javascript

var buffer = new AsyncBuffer();

function first(){
    console.log("I'm called first");
}

function second(){
    console.log("I'm called second");
}

function last(){
    console.log("I'm called last");
}

buffer.afterFinish(last);
buffer.onFinish(first);
buffer.onFinist(second);

```

For complete examples head up to tests.

## API

### AsyncBuffer.setTimeout(number)
Set timeout after all callbacks will be resolved when first buffer.start() is fired
```javascript
var buffer = new AsyncBuffer();

buffer.setTimeout(1000);
```

### AsyncBuffer.getTimeout()
Returns current timeout (note, that this is **NOT** how many ms is left until buffer.finish() is fired

### AsyncBuffer.finish()
Finishes all callbacks right away

```javascript
var buffer = new AsyncBuffer();

buffer.onFinish(function(){ console.log("Hello"); });

buffer.finish();
```


### AsyncBuffer.onFinish(callback)
Adds callback to queue
```javascript

function hello(){
    console.log('hello');
}

var buffer = new AsyncBuffer();
buffer.onFinish(hello); // hello is called after 100 ms
```

## AsyncBuffer.afterFinish(callback)
Adds callback to queue to be called after main callbacks

```javascript
var db;
function setup(){
    db = new Database();
}

function teardown(){
    db.clear();
}

var buffer = new AsyncBuffer();

buffer.onFinish(setup);
buffer.afterFinish(teardown);
```

### AsyncBuffer.onLastFinish(name, callback)
Sets callback for specific name. If previous callback for this name hasn't beed fired, it is owerriten.

```javascript
var buffer = new AsyncBuffer();
var chart = new Chart();

function iAmNeverCalled(){
    chart.redraw();
}

function butIAmCalled(){
    chart.redraw();
}

buffer.onLastFinist("redraw", iAmNeverCalled);
buffer.onLastFinist("redraw", butIAmCalled); // this way chart.redraw() is called only once
```
