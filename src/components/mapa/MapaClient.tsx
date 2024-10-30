import React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import { trpc } from '@/lib/trpc';
import LocationsSelector from '@/components/mapa/LocationsSelector';
import MapMarker from '@/components/mapa/MapMarker';
import HouseIcon from '@/components/icons/HouseIcon';
import CakeIcon from '@/components/icons/CakeIcon';
// switch dependiendo de count, color en que se pinta el Marker
function ColorMarker(count: number) {
  switch (true) {
    case count < 3:
      return 'fill-green-500';
    case count < 5:
      return 'fill-yellow-500';
    case count < 10:
      return 'fill-orange-500';
    case count >= 10:
      return 'fill-red-500';
    default:
      return 'fill-gray-500'; // Default color if no conditions are met
  }
}

interface MapaClientProps {}

const MapaClient = ({}: MapaClientProps) => {
  const [selectedLocation, setSelectedLocation] = React.useState<
    'residence' | 'birth' | 'none' | 'all'
  >('all');
  const { data: locations, isLoading } = trpc.location.getLocations.useQuery();

  const { birthLocations, residenceLocations } = locations || {};

  return (
    <>
      {isLoading ? (
        <div className='flex h-full w-full items-center justify-center'>
          Cargando el mapa...
        </div>
      ) : (
        <div className='relative h-full w-full'>
          <div className='absolute right-4 top-4 z-10'>
            <LocationsSelector
              setSelectedLocation={setSelectedLocation}
              selectedLocation={selectedLocation}
            />
          </div>
          <MapContainer
            className='absolute inset-0'
            center={[-37.973, -68.937]}
            style={{ zIndex: 2 }}
            zoom={5}
            minZoom={2}
          >
            <TileLayer
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              noWrap
            />
            {['all', 'residence'].includes(selectedLocation) &&
              residenceLocations?.map((marker) => {
                const count = marker._count.residenceProfiles;
                const tailwindClass = ColorMarker(count);
                return (
                  <MapMarker
                    key={`residence_${marker.latitude}_${marker.longitude}`}
                    marker={{
                      ...marker,
                      count,
                    }}
                    icon={<HouseIcon className={`size-6 ${tailwindClass}`} />}
                    type='residence'
                  />
                );
              })}
            {['all', 'birth'].includes(selectedLocation) &&
              birthLocations?.map((marker) => {
                const count = marker._count.birthProfiles;
                const tailwindClass = ColorMarker(count);
                return (
                  <MapMarker
                    key={`birth_${marker.latitude}_${marker.longitude}`}
                    marker={{
                      ...marker,
                      count,
                    }}
                    icon={<CakeIcon className={`size-6 ${tailwindClass}`} />}
                    type='birth'
                  />
                );
              })}
          </MapContainer>
        </div>
      )}
    </>
  );
};

export default MapaClient;
