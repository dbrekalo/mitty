var assert = require('chai').assert;
var mitty = require('../');

describe('mitty', function() {

    it('augments object with events api', function() {

        var musician = mitty({name: 'George'});

        assert.isFunction(musician.on);
        assert.isFunction(musician.off);
        assert.isFunction(musician.trigger);
        assert.isFunction(musician.listenTo);
        assert.isFunction(musician.stopListening);

    });

    it('returns same object to enable method chaining', function() {

        var musician = {name: 'George'};
        var mittyMusician = mitty(musician);

        assert.strictEqual(musician,
            mittyMusician
                .on('play', function(){})
                .once('play', function(){})
                .off('play')
                .trigger('play')
                .listenTo({}, 'play', function(){})
                .listenToOnce({}, 'play', function(){})
                .stopListening()
        );

    });

    it('correctly plays "on / trigger" scenario', function() {

        var musician = mitty({name: 'George'});

        musician.on('play', function() { musician.isPlaying = true; }).trigger('play');

        assert.isTrue(musician.isPlaying);

    });

    it('correctly plays "on / trigger" scenario when passing event data', function() {

        var musician = mitty({name: 'George'});
        var instrument = 'drums';

        musician.on('play', function(instrument) {
            musician.isPlayingInstrument = instrument;
        }).trigger('play', instrument);

        assert.equal(musician.isPlayingInstrument, instrument);

    });

    it('on registers multiple callbacks for same event', function() {

        var musician = mitty({name: 'George'});
        var counter = 0;

        musician.on('play', function() { ++counter; });
        musician.on('play', function() { counter += 2; });

        musician.trigger('play');

        assert.equal(counter, 3);

    });

    it('once enables one time event listening', function() {

        var musician = mitty({name: 'George', playedTimes: 0});

        musician.once('play', function() {
            musician.playedTimes += 1;
        });

        musician.trigger('play').trigger('play').trigger('play');

        assert.equal(musician.playedTimes, 1);

    });

    it('listenTo enables listening to other object events', function() {

        var musician = mitty({name: 'George'});
        var instrument = mitty({type: 'Guitar'});
        var context;

        instrument.listenTo(musician, 'play', function() {
            context = this;
            instrument.isProducingSound = true;
        });

        musician.trigger('play');

        assert.strictEqual(context, instrument);
        assert.isTrue(instrument.isProducingSound);

    });

    it('listenToOnce enables one time listening for other object events', function() {

        var musician = mitty({name: 'George'});
        var instrument = mitty({type: 'Guitar', playedTimes: 0});

        instrument.listenToOnce(musician, 'play', function() {
            instrument.playedTimes += 1;
        });

        musician.trigger('play').trigger('play').trigger('play');

        assert.equal(instrument.playedTimes, 1);

    });

    it('off removes only specified callback', function() {

        var musician = mitty({name: 'George'});
        var instrument = 'drums';
        var playHandler = function(instrumentType) {
            musician.isPlayingInstrument = instrumentType;
        };
        var secondPlayHandler = function() {
            musician.isPlayingAgain = true;
        };

        musician.on('play', playHandler).on('play', secondPlayHandler);
        musician.off('play', playHandler);
        musician.trigger('play', instrument);

        assert.isUndefined(musician.isPlayingInstrument);
        assert.isTrue(musician.isPlayingAgain);

    });

    it('off removes all callbacks for event name', function() {

        var musician = mitty({name: 'George'});
        var playCounter = 0;
        var isDancing = false;

        musician.on('play', function() {
            ++playCounter;
        }).on('play', function() {
            ++playCounter;
        }).on('dance', function() {
            isDancing = true;
        });

        musician.off('play').trigger('play').trigger('dance');

        assert.equal(playCounter, 0);
        assert.isTrue(isDancing);

    });

    it('off removes all listeners when called with no arguments', function() {

        var musician = mitty({name: 'George'});
        var playCounter = 0;
        var isDancing = false;

        musician.on('play', function() {
            ++playCounter;
        }).on('play', function() {
            ++playCounter;
        }).on('dance', function() {
            isDancing = true;
        });

        musician.off().trigger('play').trigger('dance');

        assert.equal(playCounter, 0);
        assert.isFalse(isDancing);

    });

    it('stopListening will remove listener speficied with object, event and callback', function() {

        var musician = mitty({name: 'George'});
        var instrument = mitty({type: 'Guitar'});
        var listener = function() { instrument.isProducingSound = true; };

        instrument.listenTo(musician, 'play', listener);
        instrument.listenTo(musician, 'walkAway', function() { instrument.isSilent = true; });

        instrument.stopListening(musician, 'play', listener);

        musician.trigger('play').trigger('walkAway');

        assert.isTrue(instrument.isSilent);
        assert.isUndefined(instrument.isProducingSound);

    });

    it('stopListening will remove listener speficied with object and event', function() {

        var musician = mitty({name: 'George'});
        var instrument = mitty({type: 'Guitar'});

        instrument.listenTo(musician, 'play', function() { instrument.isProducingSound = true; });
        instrument.listenTo(musician, 'walkAway', function() { instrument.isSilent = true; });
        instrument.stopListening(musician, 'play');

        musician.trigger('play').trigger('walkAway');

        assert.isTrue(instrument.isSilent);
        assert.isUndefined(instrument.isProducingSound);

    });

    it('stopListening will remove listener speficied with object', function() {

        var musician = mitty({name: 'George'});
        var instrument = mitty({type: 'Guitar'});

        instrument.listenTo(musician, 'play', function() { instrument.isProducingSound = true; });
        instrument.stopListening(musician);

        musician.trigger('play');

        assert.isUndefined(instrument.isProducingSound);

    });

    it('stopListening will remove all listeners', function() {

        var musician = mitty({name: 'George'});
        var instrument = mitty({type: 'Guitar'});

        instrument.listenTo(musician, 'play', function() { instrument.isProducingSound = true; });
        instrument.listenTo(musician, 'walkAway', function() { instrument.isSilent = true; });
        instrument.stopListening();

        musician.trigger('play').trigger('walkAway');

        assert.isUndefined(instrument.isSilent);
        assert.isUndefined(instrument.isProducingSound);

    });

    it('off with no arguments will remove listenTo subscriptions', function() {

        var musician = mitty({name: 'George'});
        var instrument = mitty({type: 'Guitar'});

        instrument.listenTo(musician, 'play', function() { instrument.isProducingSound = true; });
        instrument.listenTo(musician, 'walkAway', function() { instrument.isSilent = true; });

        musician.off();
        musician.trigger('play').trigger('walkAway');

        assert.isUndefined(instrument.isSilent);
        assert.isUndefined(instrument.isProducingSound);

    });

});
