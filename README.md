# Mitty
[![Build Status](https://travis-ci.org/dbrekalo/mitty.svg?branch=master)](https://travis-ci.org/dbrekalo/mitty)
[![Coverage Status](https://coveralls.io/repos/github/dbrekalo/mitty/badge.svg?branch=master)](https://coveralls.io/github/dbrekalo/mitty?branch=master)

Simple event emitter for javascript. Enables objects to publish and subscribe to custom events.
Works client and server side. Weighs less than 1KB.

[Demo and documentation can be found here](http://dbrekalo.github.io/mitty/)

With mitty every extended object can publish and listen to custom events.
Objects can be both publishers and subscribers simultaneously.
Mitty provides a simple api for one object to listen to it's own events or subscribe to some other object events.

Supports all browsers that are ES5-compliant (IE8 and below are not supported).

## Examples and api

### on and trigger
Subscribe object to events with on(), publish events with trigger().

```js
// start with simple object
var musician = {name: 'George'};

// use "mitty" function to augment object with event api
mitty(musician);

// subscribe to play event
musician.on('play', function(message) {
    console.log(this.name + ' is currently playing. ' + message);
});

// trigger / publish "play" event with custom message as data
// outputs 'George is currently playing. With style!'
musician.trigger('play', 'With style!');
```
### off
Remove events with off()

```js
// Remove subscription
musician.off('play');

// Trigger does nothing since we removed  subscription
musician.trigger('play', 'With style again!');
```

### listenTo and stopListening
Use listenTo() when you want to subscribe to some other object events.
Invoke stopListening() when you want to remove those subscriptions.

```js
var instrument = mitty({type: 'Guitar'});

instrument.listenTo(musician, 'play', function() {
    console.log(musician.name + ' is playing ' + this.type + ' with grace!');
});

// Outputs 'George is playing Guitar with grace!'
musician.trigger('play');

// Remove subscription
instrument.stopListening(musician);

// Will not output
musician.trigger('play');
```

### once and listenToOnce
Use once() and listenToOnce() when for executing one time event listeners.

```js
var musician = mitty({name: 'George', playedTimes: 0});

musician.once('play', function() {
    musician.playedTimes += 1;
});

musician.trigger('play').trigger('play').trigger('play');

console.log(musician.playedTimes) // outputs 1
```

```js
var musician = mitty({name: 'George'});
var instrument = mitty({type: 'Guitar', playedTimes: 0});

instrument.listenToOnce(musician, 'play', function() {
    instrument.playedTimes += 1;
});

musician.trigger('play').trigger('play').trigger('play');

console.log(instrument.playedTimes) // outputs 1
```

### Augmenting objects
Types / prototype based constructor functions can also be augmented with events like so:

```js
function Person(name) {
    this.name = name;
}

mitty(Person.prototype);

var john = new Person('John');

john.on('sayHello', function() {
    console.log(this.name + ' says hello');
});

john.trigger('sayHello'); // outputs 'John says hello'
```

## Installation

Mitty types is packaged as UMD library so you can use it both on client and server (CommonJS and AMD environment) or with browser globals.

```js
// install via npm
npm install mitty --save

// if you use bundler
var mitty = require('mitty');

// or use browser globals
var mitty = window.mitty;
```