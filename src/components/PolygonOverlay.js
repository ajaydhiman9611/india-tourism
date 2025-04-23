import { useEffect } from 'react';
import { useMap, useApiIsLoaded } from '@vis.gl/react-google-maps';

const PolygonOverlay = ({ paths, options, onClick }) => {
  const map = useMap();
  const isLoaded = useApiIsLoaded();

  useEffect(() => {
    if (!map || !isLoaded || !paths || !window.google) return;

    const polygon = new window.google.maps.Polygon({
      paths,
      ...options,
    });

    polygon.setMap(map);

    if (onClick) {
      polygon.addListener('click', onClick);
    }

    return () => {
      polygon.setMap(null);
    };
  }, [map, isLoaded, paths, options, onClick]);

  return null;
};

export default PolygonOverlay;
