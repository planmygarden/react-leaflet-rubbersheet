import L from 'leaflet';
import MatrixUtil from './matrix-util';
import { DistortHandle, RotateHandle } from './handles';
const LeafletRubbersheet = L.ImageOverlay.extend({
  options: {
    opacity: 1,
    alt: '',
    interactive: false,
    crossOrigin: false,
    errorOverlayUrl: '',
    height: 200,
    zIndex: 1,
    className: '',
  },

  initialize: function (url, corners, mode, options) {
    this._loaded = false;
    this._url = url;
    this._corners = corners;
    this._mode = mode;
    L.Util.setOptions(this, options);
  },

  onAdd: function () {
    if (!this._image) {
      this._initImage();

      if (this.options.opacity < 1) {
        this._updateOpacity();
      }
    }

    if (this.options.interactive) {
      L.DomUtil.addClass(this._image, 'leaflet-interactive');
      this.addInteractiveTarget(this._image);
    }

    this.getPane().appendChild(this._image);
    this._reset();
  },

  // TODO Verify that cleanup works
  onRemove: function () {
    L.DomUtil.remove(this._image);

    if (this.options.interactive) { this.removeInteractiveTarget(this._image); }

    this._map.removeLayer(this._handles);
  },

  /*
   * Calculates the centroid of the image.
   *     See http://stackoverflow.com/questions/6149175/logical-question-given-corners-find-center-of-quadrilateral
   */
  getCenter: function(ll2c, c2ll) {
    var map = this._map,
      latLngToCartesian = ll2c ? ll2c : map.latLngToLayerPoint,
      cartesianToLatLng = c2ll ? c2ll: map.layerPointToLatLng,
      nw = latLngToCartesian.call(map, this._corners[0]),
      ne = latLngToCartesian.call(map, this._corners[1]),
      se = latLngToCartesian.call(map, this._corners[2]),
      sw = latLngToCartesian.call(map, this._corners[3]),

      nmid = nw.add(ne.subtract(nw).divideBy(2)),
      smid = sw.add(se.subtract(sw).divideBy(2));

    return cartesianToLatLng.call(map, nmid.add(smid.subtract(nmid).divideBy(2)));
  },

  getCorners: function () {
    return this._corners;
  },

  getElement: function () {
    return this._image;
  },

  getEvents: function () {
    var events = {
      zoom: this._reset,
      viewreset: this._reset
    };

    if (this._zoomAnimated) {
      events.zoomanim = this._animateZoom;
    }

    return events;
  },

  setCorners: function (corners) {
    this._corners = corners

    if (this._map) {
      this._reset();
    }
    return this;
  },

  setMode: function(mode) {
    this._mode = mode;

    if(!this._loaded) { return; }

    this._map.removeLayer(this._handles);
    this._enableMode();
  },

  setOpacity: function (opacity) {
    this.options.opacity = opacity;

    if (this._image) {
      this._updateOpacity();
    }
    return this;
  },

  setStyle: function (styleOpts) {
    if (styleOpts.opacity) {
      this.setOpacity(styleOpts.opacity);
    }
    return this;
  },

  setUrl: function (url) {
    this._url = url;

    if (this._image) {
      this._image.src = url;
    }
    return this;
  },

  setZIndex: function (value) {
    this.options.zIndex = value;
    this._updateZIndex();
    return this;
  },

  bringToFront: function () {
    if (this._map) {
      L.DomUtil.toFront(this._image);
    }
    return this;
  },

  bringToBack: function () {
    if (this._map) {
      L.DomUtil.toBack(this._image);
    }
    return this;
  },

  _animateZoom: function (e) {
    if(!this._loaded) { return; }

    const map = this._map;
    const latLngToNewLayerPoint = function(latlng) {
      return map._latLngToNewLayerPoint(latlng, e.zoom, e.center);
    };
    const transformMatrix = this._calculateProjectiveTransform(latLngToNewLayerPoint);
    const topLeft = latLngToNewLayerPoint(this._corners[0]);
    const warp = MatrixUtil.getMatrixString(transformMatrix);
    const translation = this._getTranslateString(topLeft);

    if (!L.Browser.gecko) {
      this._image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(' ');
    }
  },

  _calculateAngle: function(latlngA, latlngB) {
    var map = this._map,

      centerPoint = map.latLngToLayerPoint(this.getCenter()),
      formerPoint = map.latLngToLayerPoint(latlngA),
      newPoint = map.latLngToLayerPoint(latlngB),

      initialAngle = Math.atan2(centerPoint.y - formerPoint.y, centerPoint.x - formerPoint.x),
      newAngle = Math.atan2(centerPoint.y - newPoint.y, centerPoint.x - newPoint.x);

    return newAngle - initialAngle;
  },

  /* Takes two latlngs and calculates the scaling difference. */
  _calculateScalingFactor: function(latlngA, latlngB) {
    var map = this._map,

      centerPoint = map.latLngToLayerPoint(this.getCenter()),
      formerPoint = map.latLngToLayerPoint(latlngA),
      newPoint = map.latLngToLayerPoint(latlngB),

      formerRadiusSquared = this._d2(centerPoint, formerPoint),
      newRadiusSquared = this._d2(centerPoint, newPoint);

    return Math.sqrt(newRadiusSquared / formerRadiusSquared);
  },

  _calculateProjectiveTransform: function(latLngToCartesian) {
    /* Setting reasonable but made-up image defaults
     * allow us to place images on the map before
     * they've finished downloading. */
    var offset = latLngToCartesian(this._corners[0]),
      w = this._image.offsetWidth || 500,
      h = this._image.offsetHeight || 375,
      c = [],
      j;
    /* Convert corners to container points (i.e. cartesian coordinates). */
    for (j = 0; j < this._corners.length; j++) {
      c.push(latLngToCartesian(this._corners[j])._subtract(offset));
    }

    /*
     * This matrix describes the action of the CSS transform on each corner of the image.
     * It maps from the coordinate system centered at the upper left corner of the image
     *     to the region bounded by the latlngs in this._corners.
     * For example:
     *     0, 0, c[0].x, c[0].y
     *     says that the upper-left corner of the image maps to the first latlng in this._corners.
     */
    return MatrixUtil.general2DProjection(
      0, 0, c[0].x, c[0].y,
      w, 0, c[1].x, c[1].y,
      0, h, c[2].x, c[2].y,
      w, h, c[3].x, c[3].y
    );
  },

  /* Distance between two points in cartesian space, squared (distance formula). */
  _d2: function(a, b) {
    var dx = a.x - b.x,
      dy = a.y - b.y;

    return Math.pow(dx, 2) + Math.pow(dy, 2);
  },

  _enableMode: function() {
    const handles = new L.LayerGroup();
    const HandleType = this._mode === 'distort' ? DistortHandle : RotateHandle;

    for (let i = 0; i < 4; i++) {
      handles.addLayer(new HandleType(this._corners[i], i, L.Util.bind(this._update, this)));
    }

    this._handles = handles;
    this._map.addLayer(this._handles);
  },

  _getTranslateString: function (point) {
    // on WebKit browsers (Chrome/Safari/iOS Safari/Android) using translate3d instead of translate
    // makes animation smoother as it ensures HW accel is used. Firefox 13 doesn't care
    // (same speed either way), Opera 12 doesn't support translate3d

    var is3d = L.Browser.webkit3d,
        open = 'translate' + (is3d ? '3d' : '') + '(',
        close = (is3d ? ',0' : '') + ')';

    return open + point.x + 'px,' + point.y + 'px' + close;
  },

  _initImage: function () {
    var wasElementSupplied = this._url.tagName === 'IMG';
    var img = this._image = wasElementSupplied ? this._url : L.DomUtil.create('img');

    L.DomUtil.addClass(img, 'leaflet-image-layer');
    if (this._zoomAnimated) { L.DomUtil.addClass(img, 'leaflet-zoom-animated'); }
    if (this.options.className) { L.DomUtil.addClass(img, this.options.className); }

    img.onselectstart = L.Util.falseFn;
    img.onmousemove = L.Util.falseFn;

    img.onload = L.Util.bind(this._overlayOnLoad, this, 'load');
    img.onerror = L.Util.bind(this._overlayOnError, this, 'error');

    if (this.options.crossOrigin || this.options.crossOrigin === '') {
      img.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
    }

    if (this.options.zIndex) {
      this._updateZIndex();
    }

    if (wasElementSupplied) {
      this._url = img.src;
      return;
    }

    img.src = this._url;
    img.alt = this.options.alt;
  },

  _overlayOnError: function () {
    this.fire('error');

    var errorUrl = this.options.errorOverlayUrl;
    if (errorUrl && this._url !== errorUrl) {
      this._url = errorUrl;
      this._image.src = errorUrl;
    }
  },

  _overlayOnLoad: function() {
    this._loaded = true;
    if (!this._corners) {
      const originalImageWidth = L.DomUtil.getStyle(this._image, 'width');
      const originalImageHeight = L.DomUtil.getStyle(this._image, 'height');
      const aspectRatio = parseInt(originalImageWidth) / parseInt(originalImageHeight);
      const imageHeight = this.options.height;
      const imageWidth = parseInt(aspectRatio*imageHeight);
      const center = this._map.latLngToContainerPoint(this._map.getCenter());
      const offset = new L.Point(imageWidth, imageHeight).divideBy(2);
      this._corners = [
        this._map.containerPointToLatLng(center.subtract(offset)),
        this._map.containerPointToLatLng(center.add(new L.Point(offset.x, - offset.y))),
        this._map.containerPointToLatLng(center.add(new L.Point(- offset.x, offset.y))),
        this._map.containerPointToLatLng(center.add(offset))
      ];
    }
    this._reset();
    this._enableMode();

    this.fire('load');
  },

  _reset: function () {
    if(!this._loaded) { return; }

    const latLngToLayerPoint = L.bind(this._map.latLngToLayerPoint, this._map);
    const transformMatrix = this._calculateProjectiveTransform(latLngToLayerPoint);
    const topLeft = latLngToLayerPoint(this._corners[0]);
    const warp = MatrixUtil.getMatrixString(transformMatrix);
    const translation = this._getTranslateString(topLeft);

    this._image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(' ');
    /* Set origin to the upper-left corner rather than the center of the image, which is the default. */
    this._image.style[L.DomUtil.TRANSFORM + '-origin'] = "0 0 0";
  },

  _rotateAndScale: function(angle, scaleFactor) {
    const map = this._map;
    const center = map.latLngToLayerPoint(this.getCenter());

    for (let i = 0; i < 4; i++) {
      // Rotate
      const p = map.latLngToLayerPoint(this._corners[i]).subtract(center);
      const q = new L.Point(
        Math.cos(angle)*p.x - Math.sin(angle)*p.y,
        Math.sin(angle)*p.x + Math.cos(angle)*p.y
      );
      this._corners[i] = map.layerPointToLatLng(q.add(center));

      // Scale
      const r = map.latLngToLayerPoint(this._corners[i])
        .subtract(center)
        .multiplyBy(scaleFactor)
        .add(center);
      this._corners[i] = map.layerPointToLatLng(r);
    }
  },

  _update: function(cornerIndex, latLng) {
    const { _corners: corners, _handles: handles, _mode: mode } = this;

    if(mode === 'distort') {
      corners[cornerIndex] = latLng;
    } else if(mode === 'rotate') {
      const corner = corners[cornerIndex];
      const angle = this._calculateAngle(corner, latLng);
      const scaleFactor = this._calculateScalingFactor(corner, latLng);
      this._rotateAndScale(angle, scaleFactor);
    }
    handles.eachLayer(function(handle) {
      const currentCornerIndex = handle._corner;
      if (cornerIndex === currentCornerIndex) { return; }
      handle.setLatLng(corners[handle._corner]);
    })
    this._reset();
    this.fire('edit');
  },

  _updateOpacity: function () {
    L.DomUtil.setOpacity(this._image, this.options.opacity);
  },

  _updateZIndex: function () {
    if (this._image && this.options.zIndex !== undefined && this.options.zIndex !== null) {
      this._image.style.zIndex = this.options.zIndex;
    }
  }
});

export default LeafletRubbersheet;
