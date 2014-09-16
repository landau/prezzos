//-- Beyond forEach
var items = [];

$('p.quote').each(function(el) { // commonly seen practice of creating an array of values
  items.push(el.innerText);
});

//-- Transforming data gone wrong
var ns = [1,2,3,4,5];
var doubled = [];

// A lot less concise than functions
for (var i = 0, l = ns.length; i < l; i++) {
  ns[i] *= 2;
  doubled.push(ns[i] * 2);
}

//-- Term | Collections
var obj = { dog: 'bark' };
var arr = [5, 10, 32, 50];

//-- Term | Function arity
function jump(a) { /* 1 arity */ } // Number of arguments a function accepts
function jog(a, b) { /* 2 arity */ }
function run(a, b, c) { /* 3 arity */ }

//-- Term | pure function/referential transparency
// For the same given input return the same output
// without mutating a given/global value

function append(arr, val) { return arr.concat(val); }

var arr = [1];
var x = append(arr, 2);
console.log(arr); // [1]
console.log(x); // [1, 2]


function appendMutate(arr, val) {
  arr.append(val);
  return arr;
}

var x = appendMutate(arr, 2);
console.log(arr); // [1, 2]
console.log(x); // [1, 2]
arr === x; // true

//-- Concept | Immutability | Strings
// No concern about usage of x elsewhere
var x = 'I Love Functional Programming';
x === x + '!!!'; // false

//-- Concept | Immutability | Objects
var planet = {
  name: 'Earth',
  type: 'terrestrial'
};

// Safely manipulate objects by making shallow copies
var earthLike = _.clone(planet);

var earthLike = _.extend({}, planet, { name: 'JSEarth' });

var earthLike = _.defaults({ name: 'JSEarth' }, planet);

//-- Concept | Immutability | mutating local data
function selectionSort(arr) {
  var N = arr.length;
  var localArr = arr.concat(); // local copy is safe to mutate

  for (var i = 0; i < N; i++){
    var min = i;

    for (var j = i + 1; j < N; j++) {
      if (localArr[j] < localArr[min]) min = j;
    }

    var tmp = localArr[i];
    localArr[j] = localArr[min];
    localArr[i] = tmp;
  }

  return localArr;
}

//-- Concept | Recursion
function fib(n) {
  if (n < 2) return 1; // Base case!!! not unlike the middle paramter to a for construct
  return fib(n - 2) + fib(n - 1); // calls itself
}

fib(20);

//-- Concept | Recursion | forEach
function forEach(arr, fn, ctx) {
  var l = arr.length;

  function each(i) {
    if (i > l) return; // base case
    fn.call(ctx, arr[i], i, arr);
    return each(i + 1); // tail recursion
  }

  return each(0);
}

//-- Concept | Returning functions, closures
function property(prop) {
  return function (obj) { // save for later look ups in an object
    return obj[prop];
  };
}

var getName = property('name');
getName({ name: 'Trevor' }); // Trevor
getName({ foo: 'bar' }); // undefined


//-- Concept arguments
// Array like object with index access and a length property
function obtainEnlightment(a, b) {
  arguments[0] === a; // true
  arguments[1] === b; // true
}

//-- Concept toArray
_slice = Array.prototype.slice; 
_slice.call(arguments); // convert arguments to an array

_slice = Function.call.bind(_slice);
_slice(arguments);
_slice(arguments, 1); // remove initial N values

//-- Native JS | apply
// spread values of an array across as arguments to a given function
function add(a, b) {
  if (!arguments.length) throw Error();
  if (arguments.length === 1) return a;
  return a + b;
}

add.apply(null, [1, 2]); // 3
add(1, 2); // same thing

//-- Native JS | apply | unknown arguments length
function add(a, b) {
  if (!arguments.length) throw Error();
  if (arguments.length === 1) return a;
  return a + b;
}

function addMany(a, b) {
  if (arguments.length < 3) return add(a, b);

  var ans = 0;
  // lots to keep track of
  for (var i = 0, l = arguments.length; i < l; i + 2) {
    ans += add(arguments[i], arguments[i + 1]);
  }
  return ans;
}

// 2 lines! ;)
function addMany(a, b) {
  if (arguments.length < 3) return add(a, b); // basecase
  return add(a, addMany.apply(null, _.rest(arguments))); // no new special logic other than base case
}

addMany(1, 1); // 2
addMany(1, 1, 1); // 3
addMany(1, 1, 1, 1); // 4

add(1, add(1, add(1, 1))); // Realized version

//-- Native JS || apply  || flatten
var numbers = [
  [1, 2, 3],
  [4, 5, 6]
];

function flatten(values) {
  return _concat.apply([], values); // how many lines of code to concat N number arrays impertively? :)
}

flatten(numbers); // [1, 2, 3, 4, 5, 6]

//-- Native JS || bind || basics
var info = console.log.bind(console, 'INFO:');
var warn = console.log.bind(console, 'WARN:');

// Nice logging
info('jQCon!!!'); // INFO: jQCon!!!
warn('jQCon!!!'); // WARN: jQCon!!!

//-- Native JS || bind || Implementation
function bind(fn, ctx) {
  var args = _slice.call(arguments, 2);

  return function bound() {
    fn.apply(ctx, args.concat(_.toArray(arguments)));
  };
}

//-- Native JS || bind || preserve context
// maintain proper property access for `this`
function Pony(weight) {
  this.weight = weight;
}

Pony.prototype.fly = function(height) {
  physics.fly(this.weight, height);
}

var ulysses = new Pony('Ulysses');
var values = [20, 50, 20];
values.forEach(ulysses.fly); // oops this.weight is undefined
values.forEach(ulysses.fly.bind(ulysses)); // Success!

//-- Native JS || reduce || assign es6
// merge n number of `src` into `dest`
function assign(dest) {
  if (arguments.length < 2) return dest;

  return _.rest(arguments).reduce(function(dest, src) {
    for (var p in src) {
      dest[p] = src[p];
    }
    return dest;
  }, dest);
}

var basics = { name: 'Trevor', age: 28 };
var meta = { interests: [ /*...*/ ] };
assign(basics, meta);
console.log(basics); // { name: 'Trevor', age: 28, interests: [...] }

//-- Native JS || reduce  || implementation
// Transform an array of values into some new value
function reduce(arr, fn, init) {
  var l = arr.length;

  function _reduce(acc, idx) {
    if (idx > l) return acc; // base case
    var next = fn(acc, arr[idx], idx, arr); // prepare next value (aka the accumulator)
    return _reduce(next, idx + 1);
  }

  if (!init) return _reduce(arr[0], 1); // default accumulator is at beginning of array
  return _reduce(init, 0); // accumulator is provided
}

//-- Native JS || reduce arrays  || unique
function unique() {
  return _.reduce(arguments, function(acc, arr) {
    return acc.indexOf(v) < 0 ? acc.concat(v) : acc; // in the array already, skip it
  }, []);
}

var numbers = [1, 5, 8, 8, 2, 8, 1];
unique(numbers); // [1, 5, 8, 2]

//-- Native JS || map || basic
var people = [
  { name: 'Trevor' },
  { name: 'Ryan' },
  { name: 'Josh' }
];

var names = people.map(function(o) { 
  return o.name;
});

// ['Trevor', 'Ryan', 'Josh']

var serialized = people.map(JSON.stringify); // pass any function!

//-- Native JS || map || implementation
function map(arr, fn, ctx) {
  return arr.reduce(function(acc, v) { // reuse reduce by providing an array as an accumulator
    return acc.concat(fn.call(ctx, v)); // add the value returned by `fn` to the array
  }, []);
}

//-- Native JS || map || Generate list of ajax promises
function times(fn, end) {
  // create an array of [undefined...undefined] and map the indexs
  return Array.apply(null, Array(end)).map(function(undef, idx) {
    return fn(idx);
  });
}

function mkPageUrl(n) {
  return '/page/' + n;
}

var promises = times(mkPageUrl, 20).map($.get); // array of promises to resolve!

//-- Native JS || filter || remove odds
function isEven(n) { return n % 2 === 0; }

var evens = [1, 2, 3].filter(isEven); // [2]

//-- Native JS || filter || implementation
function filter(arr, fn, ctx) {
  return arr.reduce(function(acc, v) { // reuse reduce again!
    return fn.call(ctx, v) ? acc.concat(v) : acc; // if returned value of `fn` is true then add value to new array
  }, []);
}

//-- Native JS || filter || adding start value
function identity(v) { return v; }

function range(start, end) {
  return times(identity, end + 1).filter(function(n) {
    return n >= start; // remove values that aren't >= start
  });
}

range(1, 5); // [1, 2, 3, 4, 5]

//-- Native JS || some || are all values in an array satified by a given predicate?
var people = [
  { name: 'Trevor', age: 28 },
  { name: 'Ryan', age: 29 },
  { name: 'Josh', age: 26 },
  { name: 'Paul', age: 30 }
];

people.some(function(p) { return p.age < 30; }); // false
people.some(function(p) { return p.age >= 30; }); // true

//-- Native JS || some || implementation
function some(arr, fn, ctx) {
  return arr.filter(fn, ctx).length > 0;
}

//-- Native JS || some || if statements
function isFemale(p) { return p.gender === 'female'; }

if (people.some(isFemale)) {
  // execute awesome code
}

//-- Native JS || every || implementation
var people = [
  { name: 'Trevor', age: 28 },
  { name: 'Ryan', age: 29 },
  { name: 'Josh', age: 26 },
  { name: 'Paul', age: 30 }
];

people.every(function(p) { return p.age < 30; }); // false
people.every(function(p) { return p.age <= 30; }); // true

//-- Native JS || every || implementation
function every(arr, fn, ctx) {
  return arr.filter(fn, ctx).length === arr.length;
}

//-- Native JS || every || expired articles
var articles = [
  { id: 1, expired: true },
  { id: 2, expired: false }
];

function getExpired(a) { return a.expired; }

if (articles.every(getExpired)) {
  // run really amazing procedure
}

//-- underscore || property

var people = [
  { name: 'Trevor', age: 28 },
  { name: 'Ryan', age: 29 },
  { name: 'Josh', age: 26 },
  { name: 'Paul', age: 30 }
];

var names = people.map(_.property('name'));
// ['Trevor', 'Ryan', 'Josh', 'Paul']

names = _.pluck(people, 'name');


//-- underscore || property || implementation
function property(prop) {
  return function (obj) {
    return obj[prop];
  };
}

function pluck(arr, prop) {
  return arr.map(_.property(prop));
}

//-- underscore || D3
svg.selectAll(".bar")
  .data(data)
  .enter().append("rect")
  .attr("x", function(d) { return x(d.letter); })
  .attr("width", x.rangeBand())
  .attr("y", function(d) { return y(d.frequency); });


var getLetter = _.property('letter');
var xLetter = _.compose(x, getLetter);
var getFreq = _.property('frequency');
var yFreq = _.compose(y, getFreq);

svg.selectAll(".bar")
  .data(data)
  .enter().append("rect")
  .attr("x", xLetter)
  .attr("width", x.rangeBand())
  .attr("y", yFreq);

//-- Composing basics
function greeting1(name) {
  return 'Welcome to Chicago, ' + name + '!';
}

function greeting2(name) {
  return 'Greetings from Chicago, ' + name + '!';
}

var alertGreeting1 = _.compose(alert, greeting1);
var alertGreeting2 = _.compose(alert, greeting2);
var logGreeting1 = _.compose(console.log, greeting1);
var logGreeting2 = _.compose(console.log, greeting2);

logGreeting1('JS Community'); // Welcome to Chicago, JS Community!

//-- Composing implementation
function compose() {
  var fns = _.toArray(arguments);

  return function _composed() {
    return _.initial(fns).reduceRight(function(result, fn) {
      return fn(result);
    }, _.last(fns).apply(null, arguments));
  };
}

//-- Curry Basics
var katana = { name: 'Katana', swing: function() {} };
var bat = { name: 'Baseball Bat', swing: function() {} };

var swing = _.curry(function _swing(item, speed) {
  console.log('You swung the ' + item.name + ' ' + speed + 'mph!');
  item.swing(speed);
});

var swingKatana = swing(katana);
var swingBat = swing(bat);

swingKatana(30); // You swung the Katana 30 mph!);

// Realized version of swingKatana
function swingKatana(item) {
  return function(speed) {
    console.log('You swung the ' + item.name + ' ' + speed + 'mph!');
  };
}

//-- Curry | Implementation
function curry2(f) {
  return function(a, b) {
    switch (arguments.length) {
      case 0: throw new TypeError('Function called with no arguments');
      case 1:
        return function(b) {
          return f(a, b);
        };
    }

    return f(a, b);
  };
}

//-- Partial | basics
function launchRocket(speed, velocity, angle) {
  // execute epic math equations
  console.log.apply(console, arguments);
}

var launch100 = _.partial(launchRocket, 100);
launch100(50, 90);  // 100, 50, 90
launch100(20, 83);  // 100, 20, 83

//-- Partial | implementation
function partial(fn) {
  var args = _.rest(arguments);

  return function() {
    return fn.apply(null, _concat.apply(args, arguments));
  };
}

//-- partial | Combine with other functions
var people = [
  { name: 'Trevor' },
  { name: 'Ryan' },
  { name: 'Josh' }
];

var isTrevor = _.compose(_.partial(_.isEqual, 'Trevor'), _.property('name'));
var isInFactTrevor = isTrevor.apply(null, people);
var trevor = _.first(people.filter(isTrevor)); // { name: 'Trevor' }

//-- Partial | Server Requests


//-- Predicates | Basics
_.isEqual(1, 2);
_.isNull(undefined); // false
[1,2,3,4].some(function(v) { // true, but ugly
  return _.isEqual(v, 1);
});

//-- Predicates | Implementations
function isNull(v) {
  return v === null;
}

function isEqual(a, b) {
  return a === b;
}

//-- Predicates | is.js
/* http://landau.github.io/is */
[1,2,3,4].some(is.equal(1));

var planets = [{ name: 'earth', type: 'terrestrial' } /* etc */];

var isTerrestrial = _.compose(is.equal('terrestrial'), _.property('type'));
if (planets.every(isTerrestrial)) {
  _.invoke(people, 'breathe');
}

if (planets.some(is.complement(isTerrestrial))) {
  _.invoke(people, 'suffocate');
}

var terrestrialPlanets = planets.filter(isTerrestrial);

// Predicates | Implementations
var equal = curry2(function(a, b) {
  return a === b;
});

function complement(fn) {
  return function() {
    return !fn.apply(null, arguments);
  };
}

//-- Predicates | is.js | Chaining
/* http://landau.github.io/is */
var isReserved = is.some().contains(reserved, property);
if (ENV === 'test') isReserved = isReserved.equal(property, 'test');

if (isReserved.val()) throw new Error();

//-- _.zip - getusers -> getFriends
var users = [
  { name: 'Trevor' }
];

var friends = [
  [{ name: 'Ryan' }, { name: 'Josh' }]
];

users = _.zip(users, friends);
/*
[
  [
    { name: 'Trevor' }
    [{ name: 'Ryan' }, { name: 'Josh' }]
  ]
];
*/

//-- _.zip - implementation
function zip() {
  return _.range(_.min(arguments, _.property('length')).length)
    .map(_.partial(_.pluck, arguments));
}
