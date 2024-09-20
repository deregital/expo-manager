import React from 'react';
import 'leaflet/dist/leaflet.css';
import { Marker } from '@adamscybot/react-leaflet-component-marker';
import { MapContainer, Popup, TileLayer } from 'react-leaflet';
import { trpc } from '@/lib/trpc';
import MapMarker from '@/components/icons/MapMarker';

interface MapaClientProps {}

const MapaClient = ({}: MapaClientProps) => {
  const { data: markers } = trpc.mapa.getLocations.useQuery();

  // const markers =
  //   locations &&
  //   locations.reduce(
  //     (acc, location) => {
  //       const key = `${location.latitud}-${location.longitud}`;
  //       if (acc[key]) {
  //         acc[key].count += 1;
  //       } else {
  //         acc[key] = {
  //           name: location.localidad,
  //           position: [location.latitud, location.longitud],
  //           count: 1,
  //         };
  //       }
  //       return acc;
  //     },
  //     {} as Record<
  //       string,
  //       { name: string; position: [number, number]; count: number }
  //     >
  //   );
  return (
    <MapContainer center={[-37.973, -68.937]} zoom={5}>
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
      {markers &&
        Object.values(markers).map((marker) => (
          <Marker
            key={`${marker.latitud}-${marker.longitud}`}
            position={[marker.latitud, marker.longitud]}
            icon={<MapMarker className='size-8 fill-red-500' />}
          >
            <Popup>
              <p>{marker.localidad}</p>
              <p>
                Hay {marker._count.perfiles} participantes residentes de acá
              </p>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default MapaClient;
