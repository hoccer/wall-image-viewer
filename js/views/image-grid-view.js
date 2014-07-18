'use strict';

var BackboneReactComponent = require('backbone-react-component');
var React = require('react');

module.exports = React.createClass({
  mixins: [BackboneReactComponent.mixin],

  renderImage: function(image) {
    return React.DOM.img({
      key: image.id,
      src: image.fileUrl(),
      className: 'image'
    });
  },

  render: function() {
    var imageViews = this.getCollection()
      .take(16)
      .map(this.renderImage);

    return React.DOM.div(null, imageViews);
  }
});
