import React from 'react';
import 'leaflet/dist/leaflet.css';
import { Marker } from '@adamscybot/react-leaflet-component-marker';
import { MapContainer, Popup, TileLayer } from 'react-leaflet';
import { trpc } from '@/lib/trpc';
import MapMarker from '@/components/icons/MapMarker';

interface MapaClientProps {}

const MapaClient = ({}: MapaClientProps) => {
  const { data: markers, isLoading } = trpc.mapa.getLocations.useQuery();
  // switch dependiendo de count, color en que se pinta el Marker
  function ColorMarker(participantes: number) {
    switch (true) {
      case participantes < 3:
        return 'fill-green-500';
      case participantes < 5:
        return 'fill-yellow-500';
      case participantes < 10:
        return 'fill-orange-500';
      case participantes >= 10:
        return 'fill-red-500';
      default:
        return 'fill-gray-500'; // Default color if no conditions are met
    }
  }
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
    <>
      {isLoading ? (
        <div className='flex h-full w-full items-center justify-center'>
          Cargando el mapa...
        </div>
      ) : (
        <MapContainer center={[-37.973, -68.937]} zoom={5}>
          <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
          {markers &&
            Object.values(markers).map((marker) => {
              const tailwindClass = ColorMarker(marker._count.perfiles);
              return (
                <Marker
                  key={`${marker.latitud}-${marker.longitud}`}
                  position={[marker.latitud, marker.longitud]}
                  icon={<MapMarker className={`size-8 ${tailwindClass}`} />}
                >
                  <Popup>
                    <p>{marker.localidad}</p>
                    <p>
                      Hay {marker._count.perfiles} participantes residentes de
                      acá
                    </p>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      )}
    </>
  );
};

export default MapaClient;
