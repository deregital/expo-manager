import { Marker } from '@adamscybot/react-leaflet-component-marker';
import React from 'react';
import { Popup } from 'react-leaflet';
import type { Icon, DivIcon, IconOptions } from 'leaflet';

interface MapMarkerProps {
  icon:
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | Icon<IconOptions>
    | DivIcon
    | React.ComponentType
    | undefined;
  marker: {
    city: string;
    count: number;
    latitude: number;
    longitude: number;
  };
  type: 'birth' | 'residence';
}

const MapMarker = ({ marker, icon, type }: MapMarkerProps) => {
  const { city, count, latitude, longitude } = marker;
  return (
    <Marker
      key={`${latitude}-${longitude}`}
      position={[latitude, longitude]}
      icon={icon}
    >
      <Popup>
        <p>{city}</p>
        <p>
          Hay {count} participantes{' '}
          {type === 'birth' ? 'que nacieron' : 'que viven'} acá
        </p>
      </Popup>
    </Marker>
  );
};

export default MapMarker;
