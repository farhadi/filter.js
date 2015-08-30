# filter.js
An approach to aspect-oriented programming (AOP) in javascript for both node.js and browser.

There are different use cases where AOP comes in handy, cases like logging, caching, testing, debugging, before/after filters and so on. `filter.js` provides an elegant approach to AOP in javascript. 

Installation
----------

    npm install filter.js

How to use
----------

``` javascript
Filter = require('filter.js');

// Every call to object.method will be wrapped by our filter
// Multiple filters can be applied to a single method
var f = new Filter(object, 'method', function(args, next) {
    // do something with the args
    var result = next(args);
    // do something with the result
    return result;
});

// Temporary disable filter
f.off();

// Activate a disabled filter
f.on();

// Premanently remove filter
f.remove();
```

Here is an example usage of filter.js to log and cache mysql queries:

``` javascript
var Filter = require('filter.js');
var mysql = require('mysql');
var connection = mysql.createConnection({
	host : 'localhost',
	user : 'user',
	password : 'secret',
	database : 'mydb'
});
var cache = {};

//Log queries
new Filter(connection, 'query', function(args, next) {
	var query = args[0];
	var callback = args[1];
	var start = Date.now();

	args[1] = function(err, rows) {
		console.log(query);
		console.log('Took ' + (Date.now() - start) + ' ms');
		callback(err, rows);
	};

	return next(args);
});

// Cache SELECT queries
new Filter(connection, 'query', function(args, next) {
	var query = args[0];
	var callback = args[1];

	// Cache only SELECT queries
	if (!query.match(/^SELECT/i)) {
		return next(args);
	}

	//Check if we already have cached result in memory
	if (cache[query]) {
		// skip executing the query
		callback(null, cache[query]);
		return;
	}

	args[1] = function(err, rows) {
		cache[query] = rows;
		callback(err, rows);
	};

	return next(args);
});


connection.query('SELECT * FROM posts', function(err, rows) {
	console.log(rows);
});
```
  

License
-------
filter.js is released under the MIT license.

The idea is inspired by [li3 filter system](http://li3.me/docs/lithium/util/collection/Filters).
