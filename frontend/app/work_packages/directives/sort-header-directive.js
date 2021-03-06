//-- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2014 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
//++

module.exports = function(I18n){

  return {
    restrict: 'A',
    templateUrl: '/templates/work_packages/sort_header.html',
    scope: {
      query: '=',
      headerName: '=',
      headerTitle: '=',
      sortable: '=',
      locale: '='
    },
    require: 'hasDropdownMenu',
    link: function(scope, element, attributes, dropdownMenuCtrl) {
      scope.$watch('query.sortation.sortElements', function(sortElements){
        var latestSortElement = sortElements[0];

        if (scope.headerName !== latestSortElement.field) {
          scope.currentSortDirection = null;
        } else {
          scope.currentSortDirection = latestSortElement.direction;
        }

        setFullTitle();
      }, true);

      function setFullTitle() {
        if(!scope.sortable) scope.fullTitle = '';

        if(scope.currentSortDirection) {
          var sortDirectionText = (scope.currentSortDirection == 'asc') ? I18n.t('js.label_ascending') : I18n.t('js.label_descending');
          scope.fullTitle = sortDirectionText + " " + I18n.t('js.label_sorted_by') + ' \"' + scope.headerTitle + '\"';
        } else {
          scope.fullTitle = I18n.t('js.label_open_menu');
        }
      }

      // active-column class setting

      function setActiveColumnClass() {
        element.toggleClass('active-column', !!scope.currentSortDirection || scope.dropDownMenuOpened);
      }
      scope.$watch(dropdownMenuCtrl.opened, function(opened) {
        scope.dropDownMenuOpened = opened;
        setActiveColumnClass();
      });
      scope.$watch('currentSortDirection', setActiveColumnClass);

    }
  };
};
