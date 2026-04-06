'use client';

import {
  Map,
  MapMarker,
  MarkerContent,
  type MapRef,
} from '@/components/control-center/map/map';
import { fetchIncidentById } from '@/lib/supabase/reports';
import { hexToCoordinates } from '@/lib/utils';
import * as React from 'react';

interface MapComponentProps {
  incidentID: string | null;
}

interface ParsedCoordinates {
  lat: number | null;
  long: number | null;
}

// Moved outside the component to ensure a stable reference and fix ESLint warning
const DEFAULT_LOCATION = [10.6499974, 122.2333324];

export function Location({ incidentID }: MapComponentProps) {
  const mapRef = React.useRef<MapRef | null>(null);
  const [parsedCoord, setParsedCoord] = React.useState<ParsedCoordinates>({
    lat: null,
    long: null,
  });

  React.useEffect(() => {
    if (!incidentID) return;

    const markIncidentLoc = async () => {
      try {
        const incidents = await fetchIncidentById(incidentID);
        if (!incidents?.location) {
          setParsedCoord({ lat: null, long: null });
          return;
        }

        const coordString = hexToCoordinates(incidents.location);
        if (!coordString) return;

        const coords = coordString.split(' ');
        if (coords.length !== 2) return;

        const lat = parseFloat(coords[0]);
        const long = parseFloat(coords[1]);

        if (!isNaN(lat) && !isNaN(long)) {
          setParsedCoord({ lat, long });
        }
      } catch (error) {
        console.error('Error fetching incident location:', error);
      }
    };
    markIncidentLoc();
  }, [incidentID]);

  React.useEffect(() => {
    if (!mapRef?.current) return;

    const hasValidCoords =
      parsedCoord.lat !== null && parsedCoord.long !== null;

    // Using index 0 and 1 from the stable DEFAULT_LOCATION constant
    const center: [number, number] = hasValidCoords
      ? [parsedCoord.long!, parsedCoord.lat!]
      : [DEFAULT_LOCATION[1], DEFAULT_LOCATION[0]];

    const zoom = hasValidCoords ? 15 : 10;

    mapRef.current.flyTo({
      center,
      zoom,
      duration: 1500,
    });
  }, [parsedCoord]); // defaultLocation removed from here as it is now static

  function zoomToMarker() {
    if (
      !mapRef?.current ||
      parsedCoord.lat === null ||
      parsedCoord.long === null
    ) {
      return;
    }

    mapRef.current.flyTo({
      center: [parsedCoord.long, parsedCoord.lat],
      zoom: 15,
      duration: 1500,
    });
  }

  return (
    <Map ref={mapRef}>
      {parsedCoord.lat !== null && parsedCoord.long !== null && (
        <MapMarker
          latitude={parsedCoord.lat}
          longitude={parsedCoord.long}
          onClick={zoomToMarker}
        >
          <MarkerContent />
        </MapMarker>
      )}
    </Map>
  );
}

export default Location;
