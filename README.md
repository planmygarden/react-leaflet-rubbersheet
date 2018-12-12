# react-leaflet-rubbersheet

> Scale, skew and rotate image overlays in react

A react-leaflet ImageOverlay that supports stretching, skewing, distorting, rotating, translating and transparency. It is designed to allow positioning and rectification of aerial, drone and UAV imagery on a react-leaflet map.

It was built for the [Plan My Garden](https://github.com/SoarEarth) platform
and borrows extensively from both the [Leaflet.DistortableImage](https://github.com/publiclab/Leaflet.DistortableImage) and [react-leaflet-distortable-imageoverlay](https://github.com/ChrisLowe-Takor/react-leaflet-distortable-imageoverlay) projects

[Live Demo](https://planmygarden.github.io/react-leaflet-rubbersheet/)

## Install

```bash
npm install --save react-leaflet-rubbersheet
```

## Usage

The `ReactLeafletRubbersheet` component takes the corners of the ImageOverlay and updates the parent on changes via the `onUpdate` handler.  The `mode` can be one of: 'rotate' and 'distort'.

```jsx
import React, { Component } from 'react'
import { Map, TileLayer } from 'react-leaflet'
import ReactLeafletRubbersheet from 'react-leaflet-rubbersheet'

class Example extends Component {
  onUpdate(corners) {
    console.log(corners);
  }

  render () {
    return (
      <Map bounds={[[43.786293, 15.647650,0],[43.686293, 15.547650,0]]}>
        <TileLayer
        noWrap={true}
        attribution=""
        url="http://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"/>

        <ReactLeafletRubbersheet
          url="https://i.imgur.com/jaRqxHa.jpg"
          onUpdate={this.onUpdate}
          opacity={1}
          mode={'rotate'}
          corners={true && [
            new L.latLng(43.78710550492949,15.647438805314396),
            new L.latLng(43.78710550492949,15.655914504316957),
            new L.latLng(43.78098644922989,15.647438805314396),
            new L.latLng(43.78098644922989,15.655914504316957)
          ]} />
      </Map>
    )
  }
}
```

## License

MIT © [Plan My Garden](https://github.com/planmygarden)
