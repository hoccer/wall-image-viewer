'use strict';

var BackboneReactComponent = require('backbone-react-component');
var React = require('react');

module.exports = React.createClass({
  mixins: [BackboneReactComponent.mixin],

  renderImage: function(image) {
    return React.DOM.div({
      key: image.id,
      style: {
        'background-image': 'url(' + image.fileUrl() + ')'
      },
      className: 'image'
    });
  },

  render: function() {
    var imageViews = this.getCollection()
      .take(15)
      .map(this.renderImage);

    return React.DOM.div({
      className: 'image-grid'
    }, imageViews);
  }
});
