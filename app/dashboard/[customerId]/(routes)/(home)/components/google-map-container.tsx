'use client'

import { JobObject } from "@/hooks/useJobs";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useMemo } from "react";

interface GoogleMapContainerProps {
  jobs: JobObject[];
}

const GoogleMapContainer: React.FC<GoogleMapContainerProps> = ({ jobs }) => {
  const center = useMemo(() => ({ lat: -37.8176665, lng: 144.9672122 }), []);

  return (
    <GoogleMap
      zoom={13}
      center={center}
      mapContainerClassName="w-[55%] rounded-[0.5rem]"
    >
      {jobs.map((job) => (
        <Marker
          key={job.jobId}
          position={{ lat: job.lat, lng: job.lng }}
        />
      ))}
    </GoogleMap>
  );
};

export default GoogleMapContainer;
