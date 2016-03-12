describe('Entities', function () {
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
        Unknown : 0,
        ClassicalCrossOver: 1,
        Pop: 2,
        Trance : 3
    };

    var PersonGenre = (function () {

        var ctor = function (personId, genre) {
            this.personId = personId;
            this.genre = genre;
        }

        return ctor;
    })();

    var persons,
        personsGenres,
        davidBowie,
        peterGabiel,
        arminVanBuuren,
        sarahBrightman;

    beforeEach(function () {
        davidBowie = new Person('David', 'Bowie', Genre.Pop);
        peterGabiel = new Person('Peter', 'Gabriel', Genre.Unknown);
        arminVanBuuren = new Person('Armin', 'van Buuren', Genre.Trance);
        andreaBocelli = new Person('Andrea', 'Bocelli', Genre.ClassicalCrossOver);
        sarahBrightman = new Person('Sarah', 'Brightman', Genre.ClassicalCrossOver);
        persons = [davidBowie, peterGabiel, arminVanBuuren, andreaBocelli, sarahBrightman];
        personsGenres = [davidBowie.genre, peterGabiel.genre, arminVanBuuren.genre, andreaBocelli.genre, sarahBrightman.genre];

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
        expect(changes.deleted[0].personId).toEqual(peterGabiel.id);
        expect(changes.deleted[0].genre).toEqual(Genre.Unknown);

        expect(changes.added.length).toEqual(1);                                //and readded
        expect(changes.added[0].personId).toEqual(peterGabiel.id);
        expect(changes.added[0].genre).toEqual(Genre.Pop);
    });
});