import React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { trpc } from '@/lib/trpc';

interface MapaClientProps {}

const MapaClient = ({}: MapaClientProps) => {
  const { data: locations } = trpc.mapa.getLocations.useQuery();

  const markers =
    locations &&
    locations.reduce(
      (acc, location) => {
        const key = `${location.latitud}-${location.longitud}`;
        if (acc[key]) {
          acc[key].count += 1;
        } else {
          acc[key] = {
            name: location.localidad,
            position: [location.latitud, location.longitud],
            count: 1,
          };
        }
        return acc;
      },
      {} as Record<
        string,
        { name: string; position: [number, number]; count: number }
      >
    );

  return (
    <MapContainer center={[-37.973, -68.937]} zoom={5}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {markers &&
        Object.values(markers).map((marker) => (
          <Marker
            key={`${marker.position[0]}-${marker.position[1]}`}
            position={[marker.position[0], marker.position[1]]}
          >
            <Popup>
              <p>{marker.name}</p>
              <p>Hay {marker.count} participantes residentes de acá</p>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default MapaClient;
