'use client';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

const MapaPage = () => {
  return (
    <div>
      <MapContainer center={[-20, -20]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Marker position={[-20, -20]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapaPage;
