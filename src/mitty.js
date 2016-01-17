(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.mitty = factory();
    }

}(this, function() {

    var registry = [];

    var api = {

        on: function(eventName, callback) {
            addToRegistry(this, this, eventName, callback);
            return this;
        },

        listenTo: function(publisher, eventName, callback) {
            addToRegistry(publisher, this, eventName, callback);
            return this;
        },

        off: function(eventName, callback) {
            removeFromRegistry(this, null, eventName, callback);
            return this;
        },

        stopListening: function(publisher, eventName, callback) {
            removeFromRegistry(publisher, this, eventName, callback);
            return this;
        },

        trigger: function(eventName, data) {
            publishEvent(this, eventName, data);
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

    function addToRegistry(publisher, listener, eventName, callback) {

        registry.push({
            publisher: publisher,
            listener: listener,
            eventName: eventName,
            callback: callback
        });

    }

    function removeFromRegistry(publisher, listener, eventName, callback) {

        var criteria = {},
            temp = [];

        listener && (criteria.listener = listener);
        callback && (criteria.callback = callback);
        eventName && (criteria.eventName = eventName);
        publisher && (criteria.publisher = publisher);

        each(registry, function(item) {

            var shouldRemove = true;

            each(criteria, function(name, ref) {
                if (item[name] !== ref) {
                    shouldRemove = false;
                }
            });

            !shouldRemove && temp.push(item);

        });

        registry = temp;

    }

    function publishEvent(publisher, eventName, data) {

        each(registry, function(item) {
            if (item.publisher === publisher && item.eventName === eventName) {
                item.callback.call(item.listener, data);
            }
        });

    }

    return function(objectToExtend) {

        each(api, function(methodName, method) {
            objectToExtend[methodName] = method;
        });

        return objectToExtend;

    };

}));
