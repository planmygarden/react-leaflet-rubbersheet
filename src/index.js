import { MapLayer, withLeaflet } from 'react-leaflet';
import PropTypes from 'prop-types';

import LeafletRubbersheet from './lib/leaflet-rubbersheet';

class ReactLeafletRubbersheet extends MapLayer {
  static propTypes = {
    url: PropTypes.string,
    corners: PropTypes.arrayOf(PropTypes.object),
    mode: PropTypes.oneOf(['distort', 'rotate', 'scale']),
    locked: PropTypes.bool,
    opacity: PropTypes.number,
    onUpdate: PropTypes.func
  }

  createLeafletElement(props) {
    const { url, corners, locked, mode, onUpdate, ...remaining } = this.props;
    if (!this.leafletRubbersheet) {
      this.leafletRubbersheet = new LeafletRubbersheet(url, corners, mode, locked, this.getOptions(remaining));
      this.leafletRubbersheet.on('edit', function(e) {
        onUpdate(this.getCorners());
      });
    }

    return this.leafletRubbersheet;
  }

  updateLeafletElement(fromProps, toProps) {
    const { locked, mode, opacity, url } = fromProps;
    const { locked: newLocked, mode: newMode, opacity: newOpacity, url: newUrl } = toProps;

    if (locked !== newLocked) { this.leafletRubbersheet.setLocked(newLocked); }
    if (mode !== newMode) { this.leafletRubbersheet.setMode(newMode); }
    if (opacity !== newOpacity) { this.leafletRubbersheet.setOpacity(newOpacity); }
    if (url !== newUrl) { this.leafletRubbersheet.setUrl(); }
  }
}

export default withLeaflet(ReactLeafletRubbersheet);
