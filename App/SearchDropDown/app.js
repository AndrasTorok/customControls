angular.module('app', ['customControls'])
.controller('mainCtrl', function ($scope, AppHelpers, $timeout, $q, CustomControlsHelper) {

    $scope.model = {
        options: new CustomControlsHelper.SearchDropDownOptions({       //configure the searchDropDown
            showSearch: true,                                           //do show the search input
            minSearchChars: 2,                                          //start to filter when t least 2 characters are in the input
            onReady: function () {
                $scope.model.options.api.setItems(new AppHelpers.ItemProvider(500));
            }
        }),
        entities: new AppHelpers.EntityProvider(100),
        anotherOptions: new CustomControlsHelper.SearchDropDownOptions({//configure the searchDropDown
            showSearch: true,                                           //do show the search input
            minSearchChars: 2,                                          //start to filter when t least 2 characters are in the input
            onReady: function () {
                $scope.model.anotherOptions.api.setItems(new AppHelpers.ItemProvider(500));
            }
        }),
        anotherValue: 23
    };

    $timeout(function () {
        $scope.model.entities = new AppHelpers.EntityProvider(200);
        $scope.model.options.api.setItems(new AppHelpers.ItemProvider(1000));
    }, 1000);
})
.factory('AppHelpers', function () {    

    var ItemProvider = (function () {

        var ctor = function (maxItems) {
            var items = [];

            for (var i = 0; i < maxItems; i++) {
                items.push({ value: i, label: i.toString() });
            }

            return items;
        }

        return ctor;
    })();

    var EntityProvider = (function () {

        var ctor = function (maxEntities) {
            var entities = [];

            for (var i = 0; i < maxEntities; i++) {
                entities.push({ value: i });
            }

            return entities;
        }

        return ctor;
    })();

    return {
        ItemProvider: ItemProvider,                                                    
        EntityProvider: EntityProvider
    };
});