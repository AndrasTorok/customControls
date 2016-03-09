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
            var _store = {};

            Object.defineProperty(this, 'store', {
                get: function() {
                    return _store; }
            });
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

    var Observer = (function () {

        var ctor = function () {
            var self = this,
                _value,
                _observers = new Dictionary();

            Object.defineProperty(this, 'value', {
                get: function () { return _value; },
                set: function (value) {
                    _value = value;
                    self.notifyObservers(value);
                }
            });

            Object.defineProperty(this, 'observers', {
                get: function () { return _observers; }
            });
        }

        ctor.prototype.addObserver = function (callback) {
            var key = Guid.newGuid();

            this.observers.add(key, callback);

            return key;
        }

        ctor.prototype.removeObserver = function (key) {
            this.observers.remove(key);
        }

        ctor.prototype.notifyObservers = function (callerKey) {         //optionally pass the callerKey
            var self = this;

            this.observers.forEach(function (key, callback) {
                if (key != callerKey) callback(self.value, callerKey);
            });
        }

        return ctor;
    })();

    var StopWatch = (function () {

        var ctor = function () {
            var startTime = Date.now(),
                stopTime;

            this.start = function () { startTime = Date.now(); }
            this.stop = function () { stopTime = Date.now(); }
            this.duration = function () {
                return stopTime - startTime;
            }
        }        

        return ctor;
    })();

    var Entity = (function () {

        var ctor = function () {

        }

        ctor.clone = function (entity) {
            var clonedEntity = {};

            for (var prop in entity) {
                if (entity.hasOwnProperty(prop)) clonedEntity[prop] = entity[prop];
            }

            return clonedEntity;
        }

        ctor.equal = function (first, second) {
            for (var prop in first) {
                if (first.hasOwnProperty(prop) && first[prop] !== second[prop]) return false;
            }

            for (var prop in second) {
                if (second.hasOwnProperty(prop) && second[prop] !== first[prop]) return false;
            }

            return true;
        }

        return ctor;
    })();

    var Entities = (function () {

        var ctor = function (params) {
            var clonedEntities = clone(params.entities);

            Object.defineProperty(this, 'entities', { get: function () { return params.entities; } });
            Object.defineProperty(this, 'pKeys', { get: function () { return params.pKeys; } });
            Object.defineProperty(this, 'clonedEntities', { get: function () { return clonedEntities; } });
        }

        ctor.prototype.changed = function () {
            var self = this,
                addedEntities = [],
                changedEntities = [],
                deletedEntities = [];

            this.entities.forEach(function (entity) {
                var clonedEntity = findByPK(self.clonedEntities, self.pKeys);

                if (!clonedEntity) addedEntities.push(entity);
                else if (!Entity.equal(entity, clonedEntity)) changedEntities.push(entity);
            });

            this.clonedEntities.forEach(function (clonedEntity) {
                if (!findByPK(self.entities, self.pKeys)) deletedEntities.push(clonedEntity);
            });

            return {
                added: addedEntities,
                changed: changedEntities,
                deleted: deletedEntities
            };
        }

        function clone(entities) {
            var clonedEntities = [];

            entities.forEach(function (entity) {
                clonedEntities.push(Entity.clone(entity));
            });

            return clonedEntities;
        }

        function findByPK(entities, pKeys) {
            var entity = entities.find(function (searchedEntity) {
                pKeys.forEach(function (key) {
                    if (searchedEntity[key] !== entity[key]) return false;
                });

                return true;
            });

            return entity;
        }

        return ctor;
    })();

    return {
        StringBuilder : StringBuilder, 
        Dictionary: Dictionary,
        Guid: Guid,
        Observer: Observer,
        StopWatch: StopWatch
    };
})();