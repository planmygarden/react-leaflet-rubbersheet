import { MapLayer, withLeaflet } from 'react-leaflet';
import PropTypes from 'prop-types';
import L from 'leaflet';

import LeafletRubbersheet from './lib/leaflet-rubbersheet';

class ReactLeafletRubbersheet extends MapLayer {
  static propTypes = {
    url: PropTypes.string,
    corners: PropTypes.arrayOf(PropTypes.object),
    mode: PropTypes.oneOf(['rotate', 'distort']),
    opacity: PropTypes.number,
    onUpdate: PropTypes.func
  }

  createLeafletElement(props) {
    const { url, corners, mode, onUpdate, ...remaining } = this.props;
    if (!this.leafletRubbersheet) {
      this.leafletRubbersheet = new LeafletRubbersheet(url, corners, mode, this.getOptions(remaining));
      this.leafletRubbersheet.on('edit', function(e) {
        onUpdate(this.getCorners())
      });
    }

    return this.leafletRubbersheet;
  }

  updateLeafletElement(fromProps, toProps) {
    const { mode, opacity } = fromProps;
    const { mode: newMode, opacity: newOpacity } = toProps;

    if (mode !== newMode) { this.leafletRubbersheet.setMode(newMode); }
    if (opacity !== newOpacity) { this.leafletRubbersheet.setOpacity(newOpacity); }
  }
}

export default withLeaflet(ReactLeafletRubbersheet);
