﻿angular.module('customControls', [])
.directive('searchDropDown', function ($compile, $templateRequest, $timeout) {
    'use strict';

    var itemsDictionary = new AppHelpers.Dictionary();

    return {
        restrict: 'EA',
        transclude: true,
        scope: {
            options: '=',
            ngModel: '='
        },
        controllerAs: 'ctrl',                                                       //use controllerAs => ready for TypeScript way to use
        controller: function ($scope, $element, $transclude) {                      //
            var self = this,                                                        //keep the context in the callbacks
                element = $element[0],                                              //persist the HTML element
                searchElement,                                                      //the search element
                focusedElement,                                                     //the element which had the focus at the moment the user clicked on the drop-down
                minSearchChars = $scope.options.minSearchChars || 2,                //the minimum characters the user should enter the filtering to start
                buttons,
                _items,
                _filteredItems;

            Object.defineProperty(this, 'items', {
                get: function () {
                    return !$scope.options.id ? _items : itemsDictionary.get($scope.options.id);
                },
                set: function (value) {
                    if (!$scope.options.id) _items = value;
                    else itemsDictionary.add($scope.options.id, value);
                }
            });

            Object.defineProperty(this, 'filteredItems', {
                get: function () {
                    if (!_filteredItems) _filteredItems = self.items;
                    return _filteredItems;
                },
                set: function (value) {
                    _filteredItems = value;
                }
            });

            this.opened = false;                                                    //drop-down expanded state
            this.toggleOpen = function () {                                         //toggle the expanded state of the control
                self.opened = !self.opened;                                         //
                if (self.opened) {                                                  //on opened
                    if (searchElement) $timeout(function () { searchElement.focus(); }); //and there is a search element the focus it , needs to happen in the next digest cycle
                    else console.log('searchElement not found');
                } else {                                                            //on closed
                    self.search = null;                                             //clear the search
                    searchChanged(self);                                            //update the filteredItems when search changed                                        
                    if (focusedElement) focusedElement.focus();                     //if we have the previouly focused element then focus it
                }
            };
            this.selected = function (index) {                                      //on selecting an item
                self.selectedItem = self.filteredItems[index];                      //get the selected item from the filtered list
                $scope.ngModel = self.selectedItem.value;                           //set the model provided using 2 way binding to teh new value
                self.toggleOpen();                                                  //toggle the drop down state to closed
            };
            this.search = null;                                                     //search term
            this.searchChanged = function () { searchChanged(self); };              //on search changed
            this.showSearch = $scope.options.showSearch;                            //persist the showState for more convenient use
            //this.items = this.filteredItems = $scope.options.items;                 //items to be displayed
            this.selectedItem = selectedItem($scope.ngModel);                       //set the selected item

            $scope.options.api = {                                                  //expose an API to the client
                setItems: function (items) {                                        //set the items
                    self.items = self.filteredItems = items;
                }
            };

            $templateRequest('./search-drop-down.html').then(function (html) {      //get the template and transclude it
                var template = angular.element(html),                               //get the template 
                    templateEl = angular.element(template);                         //create an HTML element from the template

                $transclude($scope, function (clonedContent) {                      //transclude it
                    templateEl.find('theplaceholder').replaceWith(clonedContent);   //replace the placeholder with the transcluded content

                    $compile(templateEl)($scope, function (clonedTemplate) {        //compile it
                        $element.append(clonedTemplate);                            //append  it     

                        if ($scope.options.onReady) $scope.options.onReady();
                    });
                });
            });            

            $timeout(function () {                                                  //this initialization should run in the next digest cycle
                if ($scope.options.showSearch) {                                    //if the search input is active
                    searchElement = element.querySelector('input[type="search"]');    //then find and persist it

                    if (searchElement) {                                            //
                        buttons = [element.querySelector('.custom-button'),         //find the 2 buttons
                            element.querySelector('.dropdown-toggle')];             //composing the drop-down

                        buttons.forEach(function (button) {                         //each of them
                            button.addEventListener('focus', onFocus);              //on focus 
                        });                        
                    }
                }
            });

            document.addEventListener('keyup', onKeyUp);

            $scope.$on('$destroy', function () {                                    //remove the event handlers when the scope is destroyed
                document.removeEventListener('keyup', onKeyUp);
                if (buttons) buttons.forEach(function (button) {                    //each of them
                    button.removeEventListener('focus', onFocus);                   //remove on focus 
                });
            });

            function searchChanged(self) {                                          //on search term is changing
                var seachTerm = self.search && self.search.length >= minSearchChars ? self.search.toLowerCase() : null; //set it to lower case
                self.filteredItems = seachTerm ? self.items.filter(function (item) { return item.label.toLowerCase().indexOf(seachTerm) >= 0; }) : self.items;  //filter by lowercase
            }

            function selectedItem(value) {
                return self.filteredItems ? self.filteredItems.find(function (item) { return item.value == value; }) : null;
            }

            function onKeyUp(evt) {                                                 //on escape
                if (evt.keyCode == 27 && self.opened) $timeout(function () { self.toggleOpen(); }); //close the drop-down
            }

            function onFocus(evt) {             //on getting the focus save the element which had the focus before it
                if (evt.relatedTarget && evt.relatedTarget != searchElement) focusedElement = evt.relatedTarget;    //
            }
        }
    };
})
