(function(root, factory) {

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.mitty = factory();
    }

}(this, function() {

    var counter = 0;

    var api = {

        on: function(eventName, callback) {
            addEvent(this, this, eventName, callback);
            return this;
        },

        once: function(eventName, callback) {
            addEvent(this, this, eventName, callback, true);
            return this;
        },

        listenTo: function(publisher, eventName, callback) {
            addEvent(publisher, this, eventName, callback);
            return this;
        },

        listenToOnce: function(publisher, eventName, callback) {
            addEvent(publisher, this, eventName, callback, true);
            return this;
        },

        off: function(eventName, callback) {
            removeEvent(this, eventName, callback);
            return this;
        },

        stopListening: function(publisher, eventName, callback) {
            removeEventFromListener(this, publisher, eventName, callback);
            return this;
        },

        trigger: function(eventName, data) {
            runEvent(this, eventName, data);
            return this;
        }

    };

    function runEvent(publisher, eventName, data) {

        publisher._mittyOn && publisher._mittyOn.slice().forEach(function(entry) {

            if (entry.eventName === eventName) {

                entry.callback.call(entry.listener, data);

                if (entry.runOnce) {
                    entry.listener === entry.publisher
                        ? removeEvent(entry.publisher, eventName, entry.callback)
                        : removeEventFromListener(
                            entry.listener, entry.publisher, eventName, entry.callback
                        )
                    ;
                }

            }

        });

    }

    function addEvent(publisher, listener, eventName, callback, runOnce) {

        var key = 'e' + (++counter);

        var entry = {
            key: key,
            publisher: publisher,
            listener: listener,
            eventName: eventName,
            callback: callback,
            runOnce: runOnce
        };

        publisher._mittyOn = publisher._mittyOn || [];
        publisher._mittyOn.push(entry);

        if (publisher !== listener) {
            listener._mittyListenTo = listener._mittyListenTo || {};
            listener._mittyListenTo[key] = entry;
        }

    }

    function removeEvent(publisher, eventName, callback) {

        if (publisher._mittyOn) {

            publisher._mittyOn = publisher._mittyOn.filter(function(entry) {

                var shouldRemove =
                    (eventName ? eventName === entry.eventName : true) &&
                    (callback ? callback === entry.callback : true)
                ;

                if (shouldRemove && (entry.listener !== entry.publisher)) {
                    delete entry.listener._mittyListenTo[entry.key];
                }

                return !shouldRemove;

            });

        }

    }

    function removeEventFromListener(listener, publisher, eventName, callback) {

        if (listener._mittyListenTo) {

            each(listener._mittyListenTo, function(key, entry) {

                var shouldRemove =
                    (publisher ? publisher === entry.publisher : true) &&
                    (eventName ? eventName === entry.eventName : true) &&
                    (callback ? callback === entry.callback : true)
                ;

                if (shouldRemove) {
                    entry.publisher._mittyOn = entry.publisher._mittyOn.filter(function(item) {
                        return item !== entry;
                    });
                    delete listener._mittyListenTo[key];
                }

            });

        }

    }

    function each(collection, callback) {

        for (var key in collection) {
            collection.hasOwnProperty(key) && callback(key, collection[key]);
        }

    }

    return function(objectToExtend) {

        each(api, function(methodName, method) {
            objectToExtend[methodName] = method;
        });

        return objectToExtend;

    };

}));
