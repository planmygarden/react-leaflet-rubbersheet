import L from 'leaflet';

export default L.Marker.extend({
  options: {
    draggable: true,
    zIndexOffset: 10,
    icon: new L.Icon({
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAAVtJREFUSMfdlU1OwzAUhD8apRvKEeAAtJfgd9uqQHsFEBUIbgHlCLCruAxiQ4sIKmzhAGFBkaAsPAYvHCVOVjCSZct+b8ae2C/w31EH+sA1kABvaonmeoophR3gGZjntCegG0IcARcOwR1wDDSBRbWm5sZO3BCoFRGw5O/AQU5SBBwCM+WcF7HFkq8FnHrdEelkBdUdz/dDPBUGyp2S8eH7jueFvPTYNRHHnp10iezRLoGvEgKfwJXGbV/Ao9RXS5BbtMSR+BZTLTYqCCyJI/VZZLFQQcDm/ljsCryoX64gsKL+1Sdwq36rgsC2+hvfYg/j3xhz5UIRAffi2PUF1DGFa455/qE44vehxVlBXQXNgI0A8k3gQ7ntvOChIzLIsSvSzi35WZHd1DBV0ZbhCXCCeUQNtRZw6nhuyYNKTEd+5v1wpkVsyUKMKVwj4AHzQlONR5jbEpcl/xv4BuutaLlCxeIRAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE4LTEyLTIzVDA5OjQzOjE3KzAwOjAw+mucNAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOC0xMi0yM1QwOTo0MzoxNyswMDowMIs2JIgAAAAodEVYdHN2ZzpiYXNlLXVyaQBmaWxlOi8vL3RtcC9tYWdpY2stZ3hQQlVpQm1I2AziAAAAAElFTkSuQmCC',
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
