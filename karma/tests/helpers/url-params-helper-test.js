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

/*jshint expr: true*/

describe('UrlParamsHelper', function() {
  var UrlParamsHelper;

  beforeEach(module('openproject.helpers'));
  beforeEach(inject(function(_UrlParamsHelper_) {
    UrlParamsHelper = _UrlParamsHelper_;
  }));

  describe('buildQueryString', function() {
    var params = {
      ids: [1, 2, 3],
      str: '@#$%'
    };
    var queryString;

    beforeEach(function() {
      queryString = UrlParamsHelper.buildQueryString(params);
    });

    it('concatenates propertys with \'&\'', function() {
      expect(queryString.split('&')).to.have.length(4);
    });

    it('escapes special characters', function() {
      expect(queryString).not.to.include('@');
    });
  });

  describe('encodeQueryJsonParams', function(){
    var query;

    beforeEach(function() {
      var filter = {
        modelName: 'soße',
        name: 'soße_id',
        type: 'list model',
        operator: '=',
        values: ['knoblauch']
      };
      query = new Query({
        id: 1,
        name: 'knoblauch soße',
        projectId: 2,
        displaySums: true,
        columns: [{ name: 'type' }, { name: 'status' }, { name: 'soße' }],
        groupBy: 'status',
        sortCriteria: 'type:desc',
        filters: [filter]
      }, { rawFilters: true });
    });

    it('should encode query to params JSON', function() {
      var encodedJSON = UrlParamsHelper.encodeQueryJsonParams(query);
      var expectedJSON = "{\"c\":[\"type\",\"status\",\"soße\"],\"s\":true,\"p\":2,\"g\":\"status\",\"t\":\"type:desc\",\"f\":[{\"n\":\"soße_id\",\"m\":\"soße\",\"o\":\"%3D\",\"t\":\"list model\",\"v\":[\"knoblauch\"]}]}";
      expect(encodedJSON).to.eq(expectedJSON);
    })
  });

  describe('decodeQueryFromJsonParams', function() {
    var params;
    var queryId;

    beforeEach(function() {
      params = "{\"c\":[\"type\",\"status\",\"soße\"],\"s\":true,\"p\":2,\"g\":\"status\",\"t\":\"type:desc\",\"f\":[{\"n\":\"soße_id\",\"m\":\"soße\",\"o\":\"%3D\",\"t\":\"list model\",\"v\":[\"knoblauch\"]}]}";
      queryId = 2;
    });

    it('should decode query params to object', function() {
      var decodedQueryParams = UrlParamsHelper.decodeQueryFromJsonParams(queryId, params);

      var expected = {
        id: queryId,
        projectId: 2,
        displaySums: true,
        columns: [{ name: 'type' }, { name: 'status' }, { name: 'soße' }],
        groupBy: 'status',
        sortCriteria: 'type:desc',
        filters: [{
          modelName: 'soße',
          name: 'soße_id',
          type: 'list model',
          operator: '=',
          values: ['knoblauch']
        }]
      };

      expect(angular.equals(decodedQueryParams, expected)).to.be.true;
    });
  })
});