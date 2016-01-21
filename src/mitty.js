(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.mitty = factory();
    }

}(this, function() {

    var api = {

        on: function(eventName, callback) {
            registerEvent(this, this, eventName, callback);
            return this;
        },

        listenTo: function(publisher, eventName, callback) {
            registerEvent(publisher, this, eventName, callback);
            this._mittyListenTo = this._mittyListenTo || [];
            indexOf(this._mittyListenTo, publisher) < 0 && this._mittyListenTo.push(publisher);
            return this;
        },

        off: function(eventName, callback) {
            removeFromPublisher(this, null, eventName, callback);
            return this;
        },

        stopListening: function(publisher, eventName, callback) {
            removeFromListener(this, publisher, eventName, callback);
            return this;
        },

        trigger: function(eventName, data) {
            this._mittyOn && each(this._mittyOn, function(item) {
                if (item.eventName === eventName) {
                    item.callback.call(item.listener, data);
                }
            });
            return this;
        }
    };

    function each(collection, callback) {

        if (collection instanceof Array) {
            for (var i = 0; i < collection.length; i++) {
                callback(collection[i], i);
            }
        } else {
            for (var key in collection) {
                collection.hasOwnProperty(key) && callback(key, collection[key]);
            }
        }

    }

    function indexOf(collection, objectToSearch) {

        if (Array.prototype.indexOf) {
            return collection.indexOf(objectToSearch);
        } else {
            for (var i = 0; i < collection.length; i++) {
                if (collection[i] === objectToSearch) {
                    return i;
                }
            }
            return -1;
        }

    }

    function registerEvent(publisher, listener, eventName, callback) {

        publisher._mittyOn = publisher._mittyOn || [];

        publisher._mittyOn.push({
            listener: listener,
            eventName: eventName,
            callback: callback
        });

    }

    function removeFromPublisher(publisher, listener, eventName, callback) {

        if (publisher._mittyOn && publisher._mittyOn.length) {

            var criteria = {},
            temp = [];

            listener && (criteria.listener = listener);
            callback && (criteria.callback = callback);
            eventName && (criteria.eventName = eventName);

            each(publisher._mittyOn, function(item) {

                var shouldRemove = true;

                each(criteria, function(name, ref) {
                    if (item[name] !== ref) {
                        shouldRemove = false;
                    }
                });

                !shouldRemove && temp.push(item);

            });

            publisher._mittyOn = temp;

        }

    }

    function containsListener(publisher, listener) {

        if (publisher._mittyOn) {
            for (var i = 0; i < publisher._mittyOn.length; i++) {
                if (publisher._mittyOn[i].listener === listener) {
                    return true;
                }
            }
        }
        return false;

    }

    function removeFromListener(listener, publisher, eventName, callback) {

        var listening = listener._mittyListenTo && listener._mittyListenTo.length > 0;

        if (publisher && listening) {

            removeFromPublisher(publisher, listener, eventName, callback);

            if (!containsListener(publisher, listener)) {
                listener._mittyListenTo.splice(indexOf(listener._mittyListenTo, publisher), 1);
            }

        } else if (listening) {

            each(listener._mittyListenTo, function(item) {
                removeFromPublisher(item, listener);
            });
            listener._mittyListenTo = [];

        }

    }

    return function(objectToExtend) {

        each(api, function(methodName, method) {
            objectToExtend[methodName] = method;
        });

        return objectToExtend;

    };

}));
