/** @jsx React.DOM */

'use strict';

var React = require('react');
var BackboneReactComponent = require('backbone-react-component');

module.exports = React.createClass({
  mixins: [BackboneReactComponent.mixin],

  renderImage: function(image) {
    /* jshint ignore:start */
    return <img key={image.id} src={image.get('url')}/>;
    /* jshint ignore:end */
  },

  render: function() {
    /* jshint ignore:start */
    return <div>{this.getCollection().map(this.renderImage)}</div>;
    /* jshint ignore:end */
  }
});
