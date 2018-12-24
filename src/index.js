import { MapLayer, withLeaflet } from 'react-leaflet';
import PropTypes from 'prop-types';

import LeafletRubbersheet from './lib/leaflet-rubbersheet';

class ReactLeafletRubbersheet extends MapLayer {
  static propTypes = {
    url: PropTypes.string,
    corners: PropTypes.arrayOf(PropTypes.object),
    mode: PropTypes.oneOf(['distort', 'rotate', 'scale']),
    opacity: PropTypes.number,
    onUpdate: PropTypes.func
  }

  createLeafletElement(props) {
    const { url, corners, mode, onUpdate, ...remaining } = this.props;
    if (!this.leafletRubbersheet) {
      this.leafletRubbersheet = new LeafletRubbersheet(url, corners, mode, this.getOptions(remaining));
      this.leafletRubbersheet.on('edit', function(e) {
        onUpdate(this.getCorners());
      });
    }

    return this.leafletRubbersheet;
  }

  updateLeafletElement(fromProps, toProps) {
    const { mode, opacity, url } = fromProps;
    const { mode: newMode, opacity: newOpacity, url: newUrl } = toProps;

    if (mode !== newMode) { this.leafletRubbersheet.setMode(newMode); }
    if (opacity !== newOpacity) { this.leafletRubbersheet.setOpacity(newOpacity); }
    if (url !== newUrl) { this.leafletRubbersheet.setUrl(newUrl); }
  }
}

export default withLeaflet(ReactLeafletRubbersheet);
