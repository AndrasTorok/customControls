var Helpers = (function () {
    'use strict';

    var StringBuilder = (function () {                              //StringBuilder implementation

        var ctor = function () {
            var sb = [];

            Object.defineProperty(this, 'store', { get function() { return store; } });

            this.append(arguments);
        }

        ctor.prototype.append = function () {
            for (var i = 0; i < arguments.length; i++) this.store.push(arguments[i]);
        }

        ctor.prototype.toString = function () {
            return this.store.join();
        }

        return ctor;
    })();

    var Dictionary = (function () {                                     //Dictionary implementation
        var type = 'Helpers.Dictionary';

        var ctor = function () {
            var store = {};

            Object.defineProperty(this, 'store', { get function() { return store; } });
        }

        ctor.prototype.add = function (key, value) {
            this.store[key] = value;
        }

        ctor.prototype.remove = function (key) {
            delete this.store[key];
        }

        ctor.prototype.get = function (key) {
            return this.store[key];
        }

        ctor.prototype.containsKey = function (key) {
            return key in this.store;
        }

        ctor.prototype.forEach = function (callback) {
            if (typeof (callback) != 'function') throw new Error(type + '.forEach(callback): callback should be a function.');

            for (var key in this.store) {
                callback(key, this.get(key));
            }
        }

        ctor.prototype.first = function (predicate) {
            throwErrorIfPredicateNotFunction('first', predicate);

            this.forEach(function (key, value) {
                if (predicate(key, value)) return { key: key, value: value };
            });

            return null;
        }

        ctor.propertyIsEnumerable.any = function (predicate) {
            throwErrorIfPredicateNotFunction('any', predicate);

            this.forEach(function (key, value) {
                if (predicate(key, value)) return true;
            });

            return false;
        }

        ctor.propertyIsEnumerable.all = function (predicate) {
            throwErrorIfPredicateNotFunction('all', predicate);

            this.forEach(function (key, value) {
                if (!predicate(key, value)) return false;
            });

            return true;
        }

        function throwErrorIfPredicateNotFunction(fctName, predicate) {
            if (typeof (predicate) != 'function')
                throw new Error(new StringBuilder(type, '.', fctName, '(predicate): predicate should be a fuction.').toString());
        }

        return ctor;
    })();

    var Guid = (function () {                                           //creates GUID entities
        
        var ctor = function () {
            return ctor.newGuid();
        }

        ctor.newGuid = function () {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }

        ctor.emptyGuid = function () {
            return '00000000-0000-0000-0000-000000000000';
        }

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return ctor;
    })();

    return {
        StringBuilder : StringBuilder, 
        Dictionary: Dictionary,
        Guid: Guid
    };
})();