import L from 'leaflet';

export default L.Marker.extend({
  options: {
    draggable: true,
    zIndexOffset: 10,
    icon: new L.Icon({
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAChSURBVO3BIU4DURgGwNkvL2B6AkQTLBqP4QCoSm7DDXoBLBZHDbfgICAIZjEV3YTn9uVHdMZZtcnCfI13bIzxg0emg6Nm6QVbYz3jylEsXRrvwommb49X67jFkz80fR9Mb1YxTzqiWBSLYlEsikWxKBbFolgUi2JRLIpFsSgWxaJY03fHHOu40dH07bAzWCx9Ge/TiWbpHgdsjPGNB2f/yS+7xRCyiiZPJQAAAABJRU5ErkJggg==',
      iconSize: [32, 32],
      iconAnchor: [16, 16]}
    )
  },

  initialize: function(latLng, corner, onUpdate, options) {
    this._corner = corner;
    this._onUpdate = onUpdate;
    L.setOptions(this, options);

    L.Marker.prototype.initialize.call(this, latLng, options);
  },

  onAdd: function(map) {
    L.Marker.prototype.onAdd.call(this, map);
    this._bindListeners(map);
  },

  _onHandleDrag: function() {
    this._onUpdate(this._corner, this.getLatLng());
  },

  onRemove: function(map) {
    this._unbindListeners();
    L.Marker.prototype.onRemove.call(this, map);
  },

  _bindListeners: function(map) {
    this.on({ 'drag': this._onHandleDrag }, this);
  },

  _unbindListeners: function(map) {
    this.off({ 'drag': this._onHandleDrag }, this);
  }
});
