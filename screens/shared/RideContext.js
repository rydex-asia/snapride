import React, { createContext, useContext, useMemo, useState } from "react";

const RideContext = createContext(null);

const DEFAULT_RIDE_DATA = {
  pickup: null,
  drop: null,
  pickupCoord: null,
  dropCoord: null,
  routeCoords: [],
  steps: [],
};

export const RideProvider = ({ children }) => {
  const [rideState, setRideState] = useState("WAITING_FOR_OTP");
  const [rideData, setRideData] = useState(DEFAULT_RIDE_DATA);
  const [navigationTrip, setNavigationTrip] = useState(null);
  const [captainLocation, setCaptainLocation] = useState(null);
  const [socketStatus, setSocketStatus] = useState("idle");

  const resetRide = () => {
    setRideState("WAITING_FOR_OTP");
    setRideData(DEFAULT_RIDE_DATA);
    setNavigationTrip(null);
    setCaptainLocation(null);
    setSocketStatus("idle");
  };

  const value = useMemo(
    () => ({
      rideState,
      setRideState,
      rideData,
      setRideData,
      navigationTrip,
      setNavigationTrip,
      captainLocation,
      setCaptainLocation,
      socketStatus,
      setSocketStatus,
      resetRide,
    }),
    [captainLocation, navigationTrip, rideData, rideState, socketStatus]
  );

  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
};

export const useRide = () => useContext(RideContext);
