describe('Entities', function () {
    var Person = (function () {

        var ctor = function (firstName, lastName) {
            this.id = Helpers.Guid.newGuid();
            this.firstName = firstName;
            this.lastName = lastName;
        }

        return ctor;
    })();

    var persons;

    beforeEach(function () {
        persons = [
            new Person('David', 'Bowie'),
            new Person('Peter', 'Gabriel'),
            new Person('Armin', 'van Buuren'),
            new Person('Andrea', 'Bocelli'),
            new Person('Sarah', 'Brightman'),
        ];
    });

    it('changed works ok', function () {
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
});