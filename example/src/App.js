import React from 'react';
import { Map, TileLayer } from 'react-leaflet';
import Slider from 'react-rangeslider';
import ReactLeafletRubbersheet from 'react-leaflet-rubbersheet';

import 'leaflet/dist/leaflet.css';
import 'react-rangeslider/lib/index.css';
import './index.css';
import Image from './image.jpg';
import Logo from './logo.png';

export default class App extends React.Component {
  state = { opacity: 0.75, mode: 'rotate', locked: false }

  clickDistort() {
    this.setState({ mode: 'distort' });
  }

  clickLock() {
    this.setState(prevState => ({
      locked: !prevState.locked
    }));
  }

  clickRotate() {
    this.setState({ mode: 'rotate' });
  }

  clickScale() {
    this.setState({ mode: 'scale' });
  }

  onUpdate(corners) {
    console.log(corners);
  }

  handleOpacityChange(value) {
    this.setState({
      opacity: value / 100.0
    })
  };

  render() {
    const { locked, mode, opacity } = this.state;

    return (
      <div className="map">
        <div className="center logo-container">
          <img className="logo" src={Logo} alt='Plan My Garden Logo'></img>
          <p>How well can you place this drone image on the map?<br></br>  Use the rotate, scale and distort tools to find out.</p>
        </div>

        <div className="center tool-container">
          <button className={locked ? 'btn' : 'btn enabled' } href="#" onClick={this.clickLock.bind(this)}><span className="tool-text">{locked ? 'Enable' : 'Disable'}</span></button>
          <button className={mode === 'rotate' ? 'btn enabled' : 'btn' } href="#" onClick={this.clickRotate.bind(this)}><span className="tool-text">Rotate</span></button>
          <button className={mode === 'scale' ? 'btn enabled' : 'btn' } href="#" onClick={this.clickScale.bind(this)}><span className="tool-text">Scale</span></button>
          <button className={mode === 'distort' ? 'btn enabled' : 'btn' } href="#" onClick={this.clickDistort.bind(this)}><span className="tool-text">Distort</span></button>

          <div className="opacity-container">
          <h4>Opacity:</h4>
          <Slider
            min={0}
            max={100}
            value={opacity * 100.0}
            onChange={this.handleOpacityChange.bind(this)}
          />
          </div>
        </div>

        <Map
          style={{ width: '100%', height: '800px' }}
          bounds={[[43.788434, 15.644610,0],[43.775297, 15.660593,0]]}
        >
          <TileLayer
            noWrap={true}
            attribution=""
            url="https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"/>

          <ReactLeafletRubbersheet
            url={Image}
            onUpdate={this.onUpdate.bind(this)}
            opacity={opacity}
            mode={mode}
            locked={locked} />
        </Map>
      </div>
    )
  }
}
