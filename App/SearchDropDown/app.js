angular.module('app', ['customControls'])
.controller('mainCtrl', function ($scope, AppHelpers, $timeout, $q) {

    $scope.model = {
        options: {                                                      //configure the searchDropDown
            items: [],                                                  //provide the list of items to display
            id: 'some',
            showSearch: true,                                           //do show the search input
            minSearchChars: 2,                                          //start to filter when t least 2 characters are in the input
            onReady: function () {
                $scope.model.options.api.setItems(AppHelpers.Items);
            }
        },
        entities: AppHelpers.Entities,
        anotherOptions: {                                               //configure the searchDropDown
            items: [],                                                  //provide the list of items to display
            id: 'another',
            showSearch: true,                                           //do show the search input
            minSearchChars: 2,                                          //start to filter when t least 2 characters are in the input
            onReady: function () {
                $scope.model.anotherOptions.api.setItems(AppHelpers.Items);
            }
        },
        anotherValue : 23
    };   
})
.factory('AppHelpers', function () {
    var maxItems = 1000,
        maxEntities = 100,
        items = [],
        entities = [];

    for (var i = 0; i < maxItems; i++) {
        items.push({ value: i, label: i.toString() });
    }

    for (var i = 0; i < maxEntities; i++) {
        entities.push({ value: i });
    }

    return {
        Items: items,                                                    //provide items to display in the control
        Entities: entities
    };
});