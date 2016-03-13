var Person = (function () {

    var ctor = function (firstName, lastName, genre) {
        this.id = Helpers.Guid.newGuid();
        this.firstName = firstName;
        this.lastName = lastName;
        this.updateGenre(genre);
    }

    ctor.prototype.updateGenre = function (genre) {
        this.genre = new PersonGenre(this.id, genre);
    }

    return ctor;
})();

var Genre = {
    Unknown: 0,
    ClassicalCrossOver: 1,
    Pop: 2,
    Trance: 3
};

var PersonGenre = (function () {

    var ctor = function (personId, genre) {
        this.personId = personId;
        this.genre = genre;
    }

    return ctor;
})();

var PersonsGenreProvider = (function () {

    var ctor = function () { }

    ctor.provideArray = function () {
        var persons,
            personsGenres,
            davidBowie,
            peterGabiel,
            arminVanBuuren,
            sarahBrightman;

        davidBowie = new Person('David', 'Bowie', Genre.Pop);
        peterGabiel = new Person('Peter', 'Gabriel', Genre.Unknown);
        arminVanBuuren = new Person('Armin', 'van Buuren', Genre.Trance);
        andreaBocelli = new Person('Andrea', 'Bocelli', Genre.ClassicalCrossOver);
        sarahBrightman = new Person('Sarah', 'Brightman', Genre.ClassicalCrossOver);
        persons = [davidBowie, peterGabiel, arminVanBuuren, andreaBocelli, sarahBrightman];
        personsGenres = [davidBowie.genre, peterGabiel.genre, arminVanBuuren.genre, andreaBocelli.genre, sarahBrightman.genre];

        return {
            persons: persons,
            personsGenres : personsGenres
        };
    }

    ctor.provideDictionary = function () {
        return {
            persons : Helpers.Dictionary.fromArray(ctor.provideArray().persons, 'id')
        };
    }

    return ctor;
})();

describe('StringBuilder', function () {

    it('with empty join char works OK', function () {
        var space = ' ',
            result = new Helpers.StringBuilder('Let us test this', space, 'StringBuilder')
            .append(space, 'by appending')
            .append(space, 'some text')
            .toString('');

        expect(result).toEqual('Let us test this StringBuilder by appending some text');
    });

    it('with provided join char works OK', function () {
        var result = new Helpers.StringBuilder('Let us test this', 'StringBuilder')
            .append('by appending')
            .append('some text')
            .toString(' ');

        expect(result).toEqual('Let us test this StringBuilder by appending some text');
    });

});

describe('Dictionary', function () {
    var persons,
        personsGenres;

    beforeEach(function () {
        var personsGenreProvider = PersonsGenreProvider.provideDictionary();

        persons = personsGenreProvider.persons;
    });

    it('filter works OK', function () {
        var filteredDict = persons.filter(function (key, item) {
            return item.firstName == 'Peter';
        }),
        filteredKeys = filteredDict.keys();

        expect(filteredKeys.length).toBe(1);
        expect(filteredDict.first().firstName).toBe('Peter');
    });

});

describe('Entities', function () {    
    var persons,
        personsGenres;

    beforeEach(function () {
        var personsGenreProvider = PersonsGenreProvider.provideArray();

        persons = personsGenreProvider.persons;
        personsGenres = personsGenreProvider.personsGenres;
    });

    it('changed OK for simple PK', function () {
        var entities = new Helpers.Entities({
            pKeys: ['id'],
            entities: persons
        });

        persons[1].firstName = 'Peter the Great';                   //modify Peter Grabriel
        persons.push(new Person('Lady', 'Gaga'));                   //add Lady Gaga
        persons.splice(0, 1);                                       //delete David Bowie

        var changes = entities.changed();

        expect(changes.added.length).toEqual(1);
        expect(changes.added[0].lastName).toEqual('Gaga');

        expect(changes.deleted.length).toEqual(1);
        expect(changes.deleted[0].lastName).toEqual('Bowie');

        expect(changes.changed.length).toEqual(1);
        expect(changes.changed[0].lastName).toEqual('Gabriel');
    });

    it('changed OK for composed PK', function () {
        var entities = new Helpers.Entities({
            pKeys: ['personId', 'genre'],
            entities: personsGenres
        });

        personsGenres[1].genre = Genre.Pop;                                     //when changed and item in table entities with composed PK

        var changes = entities.changed();                                       //changed result will be

        expect(changes.changed.length).toEqual(0);                              //no entities changed, but...

        expect(changes.deleted.length).toEqual(1);                              //the entity changed appears to be deleted
        expect(changes.deleted[0].personId).toEqual(personsGenres[1].personId);
        expect(changes.deleted[0].genre).toEqual(Genre.Unknown);

        expect(changes.added.length).toEqual(1);                                //and readded
        expect(changes.added[0].personId).toEqual(personsGenres[1].personId);
        expect(changes.added[0].genre).toEqual(Genre.Pop);
    });
});

describe('Observer', function () {

    it('works OK', function () {
        var observer = new Helpers.Observer(),
            theFirstValue = 'Hey',
            theSecondValue = 'You',
            fistSubjectValue,
            secondSubjectValue,
            firstSubjectKey = observer.addListener(function (value) {
                fistSubjectValue = value;
            }),
            secondSubjectKey = observer.addListener(function (value) {
                secondSubjectValue = value;
            });

        observer.value = theFirstValue;                                     //set the observer's value to theFirstValue        
        expect(fistSubjectValue).toEqual(theFirstValue);                    //should be set to both subjects
        expect(secondSubjectValue).toEqual(theFirstValue);

        observer.removeListener(secondSubjectKey);                          //remove the second subject from observing
        observer.value = theSecondValue;                                    //set the observer's value to theSecondValue        
        expect(fistSubjectValue).toEqual(theSecondValue);                   //should be set to theSecondValue
        expect(secondSubjectValue).toEqual(theFirstValue);                  //should be set to theFirstValue
    });
});