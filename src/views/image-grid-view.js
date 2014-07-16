/** @jsx React.DOM */

'use strict';

var React = require('react');
var BackboneReactComponent = require('backbone-react-component');

module.exports = React.createClass({
  mixins: [BackboneReactComponent.mixin],

  render: function() {
    /* jshint ignore:start */
    return <div>Number of Downloads: {this.props.collection.length}</div>;
    /* jshint ignore:end */
  }
});
