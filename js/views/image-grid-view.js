/** @jsx React.DOM */

'use strict';

var BackboneReactComponent = require('backbone-react-component');
var React = require('react');

module.exports = React.createClass({
  mixins: [BackboneReactComponent.mixin],

  renderImage: function(image) {
    /* jshint ignore:start */
    return <img key={image.id} src={image.fileUrl()} className='image' />;
    /* jshint ignore:end */
  },

  render: function() {
    var imageViews = this.getCollection()
      .take(16)
      .map(this.renderImage);

    /* jshint ignore:start */
    return <div>{imageViews}</div>;
    /* jshint ignore:end */
  }
});
