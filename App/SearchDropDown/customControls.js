angular.module('customControls', [])
.directive('searchDropDown', function ($compile, $templateRequest, $timeout) {
    return {
        restrict: 'EA',
        transclude: true,
        scope: {
            options: '=',
            ngModel: '='
        },
        controllerAs: 'ctrl',
        controller: function ($scope, $element, $transclude) {
            var self = this,
                searchElement,
                focusedElement,
                minSearchChars;

            this.scope = $scope;
            this.opened = false;
            this.toggleOpen = function () {
                self.opened = !self.opened;
                if (self.opened) {                    
                    if(searchElement) $timeout(function () { searchElement.focus(); });
                } else {                    
                    self.search = null;
                    self.searchChanged();
                    if (focusedElement) focusedElement.focus();
                }
            };
            this.items = [];
            this.selected = function (index) {
                self.selectedItem = self.filteredItems[index];
                $scope.ngModel = self.selectedItem;
                self.toggleOpen();
            };
            this.selectedItem = null;
            this.search = null;
            this.searchChanged = function () {
                var seachTerm = self.search && self.search.length >= minSearchChars ? self.search.toLowerCase() : null;
                self.filteredItems = seachTerm ? self.items.filter(function (item) { return item.label.toLowerCase().indexOf(seachTerm) >= 0; }) : self.items;

            };
            this.filteredItems = [];

            $templateRequest('./search-drop-down.html').then(function (html) {
                var template = angular.element(html);

                var templateEl = angular.element(template);

                $transclude($scope, function (clonedContent) {
                    templateEl.find('theplaceholder').replaceWith(clonedContent);

                    $compile(templateEl)($scope, function (clonedTemplate) {
                        $element.append(clonedTemplate);                                                
                    });
                });
            });

            $scope.$watch('options', function () {
                if ($scope.options) {
                    self.items = self.filteredItems = $scope.options.items;
                    self.showSearch = $scope.options.showSearch;
                    minSearchChars = $scope.options.minSearchChars || 2;
                }
            });

            $scope.$watch('ngModel', function () {
                self.selectedItem = $scope.ngModel;                
            });

            $timeout(function () {
                var element = $element[0];
                if ($scope.options.showSearch) {
                    searchElement = document.querySelector('input[type="search"]', element);

                    if (searchElement) {
                        var buttons = [document.querySelector('.custom-button', element),
                            document.querySelector('.dropdown-toggle', element)];

                        buttons.forEach(function (button) {
                            button.addEventListener('focus', function (evt) {
                                if (evt.relatedTarget && evt.relatedTarget != searchElement) focusedElement = evt.relatedTarget;
                            });
                        });                        
                    }
                }
            });

            document.addEventListener('keyup', function (evt) {
                if (evt.keyCode == 27 && self.opened) $timeout(function () { self.toggleOpen(); });
            }, 100);
        }
    };
})
