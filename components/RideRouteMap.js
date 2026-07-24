import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import MapView, { AnimatedRegion, Circle as MapCircle, Marker, Polyline } from "react-native-maps";
import Svg, { Circle, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchStreetRoute, isValidCoordinate } from "../routeUtils";

export const PICKUP_DROP_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#EAF2FA" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#64748B" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#F8FBFF" }, { weight: 2 }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#D4E3F0" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#DCEAF6" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#4F5661" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#EEF5FB" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#D9EBDD" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#CFE8F7" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#BBD5F4" }] },
  { featureType: "transit.station", elementType: "labels.icon", stylers: [{ visibility: "on" }] },
];

const ROUTE_BLUE = "#1754E8";
const PICKUP_MARKER_BLUE = "#1754E8";
const DROP_MARKER_RED = "#E53935";
const ENDPOINT_MARKER_WIDTH = 180;
const ENDPOINT_MARKER_HEIGHT = 78;

export function StatusBarMapScrim() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      pointerEvents="none"
      colors={[
        "rgba(255,255,255,0.98)",
        "rgba(255,255,255,0.88)",
        "rgba(255,255,255,0.28)",
        "rgba(255,255,255,0)",
      ]}
      locations={[0, 0.48, 0.78, 1]}
      style={[styles.statusBarScrim, { height: Math.max(insets.top, 24) + 30 }]}
    />
  );
}

export const ENDPOINT_PIN_METRICS = Object.freeze({
  headCenterX: 7,
  headCenterY: 22.36,
  headRadius: 5.72,
  tipX: 7,
  tipY: 67.5,
});

function NearbyVehicleMapMarker({ vehicle, index }) {
  const markerSize = Number(vehicle.markerSize) || 62;
  const animatedCoordinate = useRef(new AnimatedRegion({
    latitude: vehicle.coordinate.latitude,
    longitude: vehicle.coordinate.longitude,
  })).current;

  useEffect(() => {
    const movement = animatedCoordinate.timing({
      latitude: vehicle.coordinate.latitude,
      longitude: vehicle.coordinate.longitude,
      duration: 900,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    });
    movement.start();
    return () => movement.stop?.();
  }, [animatedCoordinate, vehicle.coordinate.latitude, vehicle.coordinate.longitude]);

  if (vehicle.image) {
    return (
      <Marker.Animated
        coordinate={animatedCoordinate}
        anchor={{ x: 0.5, y: 0.5 }}
        rotation={vehicle.rotateWithBearing === false ? 0 : Number(vehicle.bearing || 0)}
        flat={vehicle.rotateWithBearing !== false}
        image={vehicle.image}
        tracksViewChanges={false}
        zIndex={20 + index}
      />
    );
  }

  return (
    <Marker.Animated
      coordinate={animatedCoordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      rotation={vehicle.rotateWithBearing === false ? 0 : Number(vehicle.bearing || 0)}
      flat={vehicle.rotateWithBearing !== false}
      tracksViewChanges
      zIndex={20 + index}
    >
      <View
        collapsable={false}
        style={[styles.nearbyVehicleMarker, { width: markerSize, height: markerSize }]}
      >
        <MaterialIcons name="two-wheeler" size={27} color="#111111" />
      </View>
    </Marker.Animated>
  );
}
export const SEARCH_ENDPOINT_PIN_METRICS = Object.freeze({
  headCenterX: 15,
  headCenterY: 21,
  headRadius: 12.2,
  tipX: 15,
  tipY: 72,
  width: 30,
  height: 72,
});
const ENDPOINT_MARKER_ANCHOR = {
  x: ENDPOINT_PIN_METRICS.tipX / ENDPOINT_MARKER_WIDTH,
  y: ENDPOINT_PIN_METRICS.tipY / ENDPOINT_MARKER_HEIGHT,
};
const SEARCH_ENDPOINT_MARKER_ANCHOR = {
  x: SEARCH_ENDPOINT_PIN_METRICS.tipX / ENDPOINT_MARKER_WIDTH,
  y: SEARCH_ENDPOINT_PIN_METRICS.tipY / ENDPOINT_MARKER_HEIGHT,
};
const PIN_ONLY_ANCHOR = {
  x: 0.5,
  y: ENDPOINT_PIN_METRICS.tipY / 68,
};
const SEARCH_PIN_ONLY_ANCHOR = {
  x: 0.5,
  y: 1,
};

function RoutePinSvg({ color = "#050505" }) {
  return (
    <Svg width={14} height={68} viewBox="0 0 14 68" fill="none">
      {/* Push Pin Stick / Needle */}
      <Path
        d="M6.125 24.9h1.75v41.5c0 .61-.39 1.1-.875 1.1s-.875-.49-.875-1.1V24.9Z"
        fill="#050505"
        
      />
      {/* Push Pin Round Head */}
      <Circle
        cx={ENDPOINT_PIN_METRICS.headCenterX}
        cy={ENDPOINT_PIN_METRICS.headCenterY}
        r={ENDPOINT_PIN_METRICS.headRadius}
        fill={color}
      />
      {/* Glossy Reflection Highlight */}
      <Path
        d="M3.43 22.29A4.78 4.78 0 0 1 6.33 19.73"
        stroke="#ffffff"
        strokeWidth="0.94"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SearchEndpointPinSvg({ color = "#2EA568" }) {
  return (
    <Svg
      width={SEARCH_ENDPOINT_PIN_METRICS.width}
      height={SEARCH_ENDPOINT_PIN_METRICS.height}
      viewBox="0 0 30 72"
      fill="none"
    >
      <Path
        d="M13 29H17V68.7L15 72L13 68.7V29Z"
        fill="#111827"
      />
      <Circle cx="15" cy="21" r="13" fill="rgba(17,24,39,0.12)" />
      <Circle cx="15" cy="21" r={SEARCH_ENDPOINT_PIN_METRICS.headRadius} fill="#FFFFFF" />
      <Circle cx="15" cy="21" r="9.2" fill={color} />
      <Circle cx="15" cy="21" r="3.7" fill="#FFFFFF" />
    </Svg>
  );
}

function PickupRadarPulse() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <View pointerEvents="none" style={styles.pickupRadarMarker}>
      <Animated.View
        style={[
          styles.pickupRadarRing,
          {
            opacity: pulse.interpolate({ inputRange: [0, 0.72, 1], outputRange: [0.5, 0.18, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1.35] }) }],
          },
        ]}
      />
      <View style={styles.pickupRadarCore} />
    </View>
  );
}

function SearchPickupRadarPulse() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 2100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <View pointerEvents="none" style={styles.searchRadarMarker}>
      <View style={styles.searchRadarSoftCore} />
      <Animated.View
        style={[
          styles.searchRadarRing,
          {
            opacity: pulse.interpolate({ inputRange: [0, 0.72, 1], outputRange: [0.3, 0.12, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.18] }) }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.searchRadarRingInner,
          {
            opacity: pulse.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0.14, 0.28, 0.08] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1.04] }) }],
          },
        ]}
      />
    </View>
  );
}


const DEFAULT_PICKUP = {
  latitude: 17.3898,
  longitude: 78.4989,
};

const DEFAULT_DROP = {
  latitude: 17.4337,
  longitude: 78.5016,
};

const ROUTE_VARIANTS = {
  default: {
    routeColor: ROUTE_BLUE,
    routeWidth: 3,
    routeOpacity: 1,
    routeBorderColor: "transparent",
    routeBorderWidth: 0,
    routeDashPattern: null,
  },
  chooseRidePreview: {
    routeColor: ROUTE_BLUE,
    routeWidth: 3,
    routeOpacity: 1,
    routeBorderColor: "transparent",
    routeBorderWidth: 0,
    routeDashPattern: null,
  },
};

function normalizeCoordinate(coord, fallback) {
  if (isValidCoordinate(coord)) return coord;
  return fallback;
}

function buildInitialRegion(pickupCoord, dropCoord, mapRegion) {
  if (mapRegion && isValidCoordinate(mapRegion)) {
    return {
      latitude: mapRegion.latitude,
      longitude: mapRegion.longitude,
      latitudeDelta: mapRegion.latitudeDelta || 0.03,
      longitudeDelta: mapRegion.longitudeDelta || 0.03,
    };
  }

  const pickup = normalizeCoordinate(pickupCoord, DEFAULT_PICKUP);
  const drop = normalizeCoordinate(dropCoord, DEFAULT_DROP);

  return {
    latitude: (pickup.latitude + drop.latitude) / 2,
    longitude: (pickup.longitude + drop.longitude) / 2,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  };
}

const NativeRideRouteMap = forwardRef(function NativeRideRouteMap(
  {
    pickupCoord,
    dropCoord,
    routeCoords = [],
    enableStreetRouteFetch = true,
    mapRegion,
    mapStyle = PICKUP_DROP_MAP_STYLE,
    showUserLocation = true,
    showMyLocationButton = true,
    showTraffic = false,
    showPointsOfInterest = false,
    interactive = true,
    onMapReady,
    onRegionChange,
    onRegionChangeComplete,
    edgePadding = { top: 90, right: 60, bottom: 110, left: 60 },
    routeVariant = "default",
    routeColor,
    routeWidth,
    routeOpacity,
    routeBorderColor,
    routeBorderWidth,
    routeDashPattern,
    captainCoord,
    showPickupMarker = true,
    showDropMarker = true,
    showCaptainMarker = true,
    attachMarkersToRouteEnds = false,
    animateRoute = false,
    routeAnimationDuration = 980,
    pickupLabel = "Pickup",
    dropLabel = "Drop",
    pickupEtaMinutes,
    dropEtaMinutes,
    pickupMeta,
    dropMeta,
    showEndpointLabels = false,
    pickupLabelEditable = false,
    dropLabelEditable = false,
    onPickupLabelPress,
    onDropLabelPress,
    startMarkerVariant = "searchPickup",
    endMarkerVariant = "searchDrop",
    showMapControls = true,
    showZoomControls = false,
    autoFitRoute = true,
    fitZoomOutLevel = 0,
    onPanDrag,
    nearbyVehicles = [],
    showPickupRadar = false,
    showDropRadar = false,
    pickupRadarVariant = "stand",
    dropRadarVariant = "stand",
    showStatusBarScrim = false,
  },
  ref
) {
  const mapRef = useRef(null);
  const initialRegion = useMemo(
    () => buildInitialRegion(pickupCoord, dropCoord, mapRegion),
    [dropCoord, mapRegion, pickupCoord]
  );
  const [cameraRegion, setCameraRegion] = useState(initialRegion);
  const [routeRefreshKey, setRouteRefreshKey] = useState(0);
  const [mapRadarPulse, setMapRadarPulse] = useState(0);

  useEffect(() => {
    const hasNativeSearchRadar =
      (showPickupRadar && pickupRadarVariant === "search") ||
      (showDropRadar && dropRadarVariant === "search");
    if (!hasNativeSearchRadar) {
      setMapRadarPulse(0);
      return undefined;
    }

    const startedAt = Date.now();
    const timer = setInterval(() => {
      setMapRadarPulse(((Date.now() - startedAt) % 2200) / 2200);
    }, 55);

    return () => clearInterval(timer);
  }, [dropRadarVariant, pickupRadarVariant, showDropRadar, showPickupRadar]);

  useEffect(() => {
    setCameraRegion(initialRegion);
  }, [initialRegion]);

  const normalizedRouteCoords = useMemo(() => (
    Array.isArray(routeCoords) ? routeCoords.filter(isValidCoordinate) : []
  ), [routeCoords]);
  const [autoStreetRoute, setAutoStreetRoute] = useState([]);
  const [routeFetchState, setRouteFetchState] = useState("idle");
  const [mapReadyState, setMapReadyState] = useState("loading");

  useEffect(() => {
    if (
      !enableStreetRouteFetch ||
      !isValidCoordinate(pickupCoord) ||
      !isValidCoordinate(dropCoord)
    ) {
      setAutoStreetRoute([]);
      setRouteFetchState("idle");
      return undefined;
    }

    let cancelled = false;

    setRouteFetchState("loading");
    fetchStreetRoute(pickupCoord, dropCoord)
      .then((route) => {
        if (cancelled) return;
        const nextRoute = Array.isArray(route?.routeCoords)
          ? route.routeCoords.filter(isValidCoordinate)
          : [];
        setAutoStreetRoute(nextRoute.length >= 2 ? nextRoute : []);
        setRouteFetchState(nextRoute.length >= 2 ? "ready" : "error");
      })
      .catch(() => {
        if (!cancelled) {
          setAutoStreetRoute([]);
          setRouteFetchState("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dropCoord, enableStreetRouteFetch, pickupCoord, routeRefreshKey]);

  const routePath = useMemo(() => {
    const streetRoute = Array.isArray(autoStreetRoute)
      ? autoStreetRoute.filter(isValidCoordinate)
      : [];

    if (streetRoute.length >= 2) return streetRoute;
    if (normalizedRouteCoords.length >= 2) return normalizedRouteCoords;
    return [];
  }, [autoStreetRoute, normalizedRouteCoords]);

  useEffect(() => {
    const timer = setTimeout(() => setMapReadyState((current) => current === "loading" ? "error" : current), 12000);
    return () => clearTimeout(timer);
  }, []);

  const pickupPoint = normalizeCoordinate(pickupCoord, DEFAULT_PICKUP);
  const dropPoint = normalizeCoordinate(dropCoord, DEFAULT_DROP);
  const routeStartPoint = attachMarkersToRouteEnds && routePath.length >= 2 ? routePath[0] : pickupPoint;
  const routeEndPoint = attachMarkersToRouteEnds && routePath.length >= 2 ? routePath[routePath.length - 1] : dropPoint;
  const captainPoint = isValidCoordinate(captainCoord) ? captainCoord : null;
  const [routeRevealCount, setRouteRevealCount] = useState(routePath.length);
  const routeStyle = ROUTE_VARIANTS[routeVariant] || ROUTE_VARIANTS.default;
  const resolvedRouteColor = routeColor || routeStyle.routeColor;
  const resolvedRouteWidth = Math.min(Number(routeWidth ?? routeStyle.routeWidth) || routeStyle.routeWidth, 6);
  const resolvedRouteOpacity = routeOpacity ?? routeStyle.routeOpacity;
  // Route halos are intentionally disabled globally so every ride and parcel
  // map uses the same single, clean polyline.
  const resolvedBorderColor = "transparent";
  const resolvedBorderWidth = 0;
  const resolvedDashPattern = routeDashPattern ?? routeStyle.routeDashPattern;
  const displayRoutePath = useMemo(() => {
    if (!animateRoute || routePath.length <= 2) return routePath;
    const visibleCount = Math.max(2, Math.min(routeRevealCount, routePath.length));
    return routePath.slice(0, visibleCount);
  }, [animateRoute, routePath, routeRevealCount]);

  useEffect(() => {
    if (!animateRoute || routePath.length <= 2) {
      setRouteRevealCount(routePath.length);
      return undefined;
    }

    setRouteRevealCount(2);
    const startedAt = Date.now();
    const frameMs = 16;
    const timer = setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / routeAnimationDuration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextCount = Math.max(2, Math.ceil(2 + (routePath.length - 2) * eased));
      setRouteRevealCount(nextCount);
      if (progress >= 1) clearInterval(timer);
    }, frameMs);

    return () => clearInterval(timer);
  }, [animateRoute, routeAnimationDuration, routePath]);


  useImperativeHandle(ref, () => ({
    animateToRegion: (...args) => mapRef.current?.animateToRegion?.(...args),
    animateCamera: (...args) => mapRef.current?.animateCamera?.(...args),
    getCamera: (...args) => mapRef.current?.getCamera?.(...args),
    pointForCoordinate: (...args) => mapRef.current?.pointForCoordinate?.(...args),
    fitToRoute: (animated = false, paddingOverride) =>
      mapRef.current?.fitToCoordinates?.(routePath, {
        edgePadding: paddingOverride || edgePadding,
        animated,
      }),
  }));

  const fitRouteToCamera = useCallback((animated = true) => {
    if (routePath.length >= 2) {
      mapRef.current?.fitToCoordinates?.(routePath, { edgePadding, animated });
      if (fitZoomOutLevel > 0) {
        setTimeout(async () => {
          try {
            const camera = await mapRef.current?.getCamera?.();
            if (!camera || !Number.isFinite(camera.zoom)) return;
            mapRef.current?.animateCamera?.(
              { ...camera, zoom: Math.max(2, camera.zoom - fitZoomOutLevel) },
              { duration: animated ? 300 : 0 }
            );
          } catch (_error) {
            // Some map providers do not expose camera zoom until the map is ready.
          }
        }, animated ? 340 : 140);
      }
      return;
    }

    mapRef.current?.animateToRegion?.(initialRegion, animated ? 320 : 0);
  }, [edgePadding, fitZoomOutLevel, initialRegion, routePath]);

  const handleGpsSync = useCallback(() => {
    setRouteRefreshKey((value) => value + 1);
    fitRouteToCamera(true);
  }, [fitRouteToCamera]);

  const handleZoom = useCallback((direction) => {
    const base = cameraRegion || initialRegion;
    const factor = direction === "in" ? 0.58 : 1.58;
    const nextRegion = {
      ...base,
      latitudeDelta: Math.max(0.002, Math.min(0.22, (base.latitudeDelta || 0.03) * factor)),
      longitudeDelta: Math.max(0.002, Math.min(0.22, (base.longitudeDelta || 0.03) * factor)),
    };

    setCameraRegion(nextRegion);
    mapRef.current?.animateToRegion?.(nextRegion, 260);
  }, [cameraRegion, initialRegion]);

  const handleRegionChanged = useCallback((region, details) => {
    if (
      (showMapControls || showZoomControls) &&
      region &&
      Number.isFinite(region.latitude) &&
      Number.isFinite(region.longitude)
    ) {
      setCameraRegion(region);
    }
    onRegionChangeComplete?.(region, details);
  }, [onRegionChangeComplete, showMapControls, showZoomControls]);

  const renderEndpointPin = (variant) => {
    if (variant === "searchPickup") return <SearchEndpointPinSvg color="#2EA568" />;
    if (variant === "searchDrop") return <SearchEndpointPinSvg color="#E5484D" />;
    const color = variant === "drop"
      ? DROP_MARKER_RED
      : variant === "captain" || variant === "current"
        ? ROUTE_BLUE
        : PICKUP_MARKER_BLUE;
    return <RoutePinSvg color={color} />;
  };

  const resolveEndpointAnchor = (variant, hasLabel) => {
    const isSearchPin = variant === "searchPickup" || variant === "searchDrop";
    if (hasLabel) return isSearchPin ? SEARCH_ENDPOINT_MARKER_ANCHOR : ENDPOINT_MARKER_ANCHOR;
    return isSearchPin ? SEARCH_PIN_ONLY_ANCHOR : PIN_ONLY_ANCHOR;
  };

  const renderEndpointLabel = (label, editable, onPress, etaMinutes, meta, variant) => {
    if (!showEndpointLabels || !label) return null;
    const isDrop = variant === "drop";

    const labelBody = (
      <>
        {etaMinutes ? (
          <View style={[
            styles.endpointEtaBlock,
            isDrop ? styles.endpointEtaBlockDrop : styles.endpointEtaBlockPickup,
          ]}>
            <View style={[
              styles.endpointEtaSlant,
              isDrop ? styles.endpointEtaSlantDrop : styles.endpointEtaSlantPickup,
            ]} />
            <Text style={[
              styles.endpointEtaValue,
              isDrop ? styles.endpointEtaTextDrop : styles.endpointEtaTextPickup,
            ]}>{etaMinutes}</Text>
            <Text style={[
              styles.endpointEtaUnit,
              isDrop ? styles.endpointEtaTextDrop : styles.endpointEtaTextPickup,
            ]}>MIN</Text>
          </View>
        ) : null}
        <View style={styles.endpointLabelCopy}>
          <Text style={styles.endpointLabelText} numberOfLines={1}>{label}</Text>
          {meta ? <Text style={styles.endpointLabelMeta} numberOfLines={1}>{meta}</Text> : null}
        </View>
        {editable ? (
          <View style={styles.endpointEditBubble}>
            <MaterialIcons name="edit" size={16} color="#1769E8" />
          </View>
        ) : null}
      </>
    );

    if (editable || onPress) {
      return (
        <Pressable
          disabled={!onPress}
          onPress={onPress}
          style={({ pressed }) => [
            styles.endpointLabel,
            isDrop ? styles.endpointLabelDrop : styles.endpointLabelPickup,
            pressed && styles.endpointLabelPressed,
          ]}
        >
          {labelBody}
        </Pressable>
      );
    }

    return (
      <View style={[
        styles.endpointLabel,
        isDrop ? styles.endpointLabelDrop : styles.endpointLabelPickup,
      ]}>{labelBody}</View>
    );
  };

  useEffect(() => {
    if (!autoFitRoute) return undefined;
    let zoomTimer;
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates?.(routePath, {
        edgePadding,
        animated: false,
      });

      if (fitZoomOutLevel > 0) {
        zoomTimer = setTimeout(async () => {
          try {
            const camera = await mapRef.current?.getCamera?.();
            if (!camera || !Number.isFinite(camera.zoom)) return;
            mapRef.current?.animateCamera?.(
              { ...camera, zoom: Math.max(2, camera.zoom - fitZoomOutLevel) },
              { duration: 260 }
            );
          } catch (_error) {
            // Keep the fitted bounds when camera zoom is unavailable.
          }
        }, 180);
      }
    }, 120);

    return () => {
      clearTimeout(timer);
      if (zoomTimer) clearTimeout(zoomTimer);
    };
  }, [autoFitRoute, edgePadding, fitZoomOutLevel, routePath]);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
      customMapStyle={mapStyle}
      showsUserLocation={showUserLocation}
      showsMyLocationButton={showMyLocationButton}
      showsBuildings={false}
      showsTraffic={showTraffic}
      showsIndoors={false}
      showsPointsOfInterest={showPointsOfInterest}
      showsCompass={false}
      rotateEnabled={interactive}
      pitchEnabled={interactive}
      scrollEnabled={interactive}
      zoomEnabled={interactive}
      loadingEnabled={false}
      toolbarEnabled={false}
      moveOnMarkerPress={false}
      onPanDrag={onPanDrag}
      onMapReady={(event) => onMapReady?.(event)}
      onMapLoaded={() => setMapReadyState("ready")}
      onRegionChange={onRegionChange}
      onRegionChangeComplete={handleRegionChanged}
    >
      {showPickupMarker && showPickupRadar && pickupRadarVariant === "search" ? (
        <>
          <MapCircle
            center={routeStartPoint}
            radius={80}
            fillColor="rgba(62,137,218,0.13)"
            strokeColor="rgba(62,137,218,0.20)"
            strokeWidth={1}
            zIndex={3}
          />
          <MapCircle
            center={routeStartPoint}
            radius={80 + (mapRadarPulse * 280)}
            fillColor={`rgba(62,137,218,${Math.max(0, 0.12 * (1 - mapRadarPulse)).toFixed(3)})`}
            strokeColor={`rgba(46,116,201,${Math.max(0, 0.38 * (1 - mapRadarPulse)).toFixed(3)})`}
            strokeWidth={1.3}
            zIndex={2}
          />
          <MapCircle
            center={routeStartPoint}
            radius={80 + (((mapRadarPulse + 0.5) % 1) * 280)}
            fillColor="rgba(62,137,218,0.025)"
            strokeColor={`rgba(46,116,201,${Math.max(0, 0.22 * (1 - ((mapRadarPulse + 0.5) % 1))).toFixed(3)})`}
            strokeWidth={1}
            zIndex={2}
          />
        </>
      ) : null}

      {showDropMarker && showDropRadar && dropRadarVariant === "search" ? (
        <>
          <MapCircle
            center={routeEndPoint}
            radius={70}
            fillColor="rgba(62,137,218,0.13)"
            strokeColor="rgba(62,137,218,0.20)"
            strokeWidth={1}
            zIndex={3}
          />
          <MapCircle
            center={routeEndPoint}
            radius={70 + (mapRadarPulse * 250)}
            fillColor={`rgba(62,137,218,${Math.max(0, 0.12 * (1 - mapRadarPulse)).toFixed(3)})`}
            strokeColor={`rgba(46,116,201,${Math.max(0, 0.36 * (1 - mapRadarPulse)).toFixed(3)})`}
            strokeWidth={1.2}
            zIndex={2}
          />
          <MapCircle
            center={routeEndPoint}
            radius={70 + (((mapRadarPulse + 0.5) % 1) * 250)}
            fillColor="rgba(62,137,218,0.025)"
            strokeColor={`rgba(46,116,201,${Math.max(0, 0.20 * (1 - ((mapRadarPulse + 0.5) % 1))).toFixed(3)})`}
            strokeWidth={1}
            zIndex={2}
          />
        </>
      ) : null}

      {routePath.length >= 2 && resolvedBorderWidth > resolvedRouteWidth ? (
        <Polyline
          coordinates={displayRoutePath}
          strokeColor={resolvedBorderColor}
          strokeWidth={resolvedBorderWidth}
          lineCap="round"
          lineJoin="round"
          lineDashPattern={resolvedDashPattern || undefined}
          zIndex={7}
        />
      ) : null}

      {routePath.length >= 2 ? (
        <Polyline
          coordinates={displayRoutePath}
          strokeColor={resolvedRouteColor}
          strokeWidth={resolvedRouteWidth}
          lineCap="round"
          lineJoin="round"
          lineDashPattern={resolvedDashPattern || undefined}
          tappable={false}
          geodesic={false}
          zIndex={8}
        />
      ) : null}

      {showPickupMarker && showPickupRadar && pickupRadarVariant !== "search" ? (
        <Marker
          key="pickup-radar-v1"
          coordinate={routeStartPoint}
          anchor={pickupRadarVariant === "search" ? { x: 0.5, y: 0.87 } : { x: 0.5, y: 0.14 }}
          tracksViewChanges
          zIndex={28}
        >
          {pickupRadarVariant === "search" ? <SearchPickupRadarPulse /> : <PickupRadarPulse />}
        </Marker>
      ) : null}

      {showDropMarker && showDropRadar && dropRadarVariant !== "search" ? (
        <Marker
          key="drop-radar-v1"
          coordinate={routeEndPoint}
          anchor={{ x: 0.5, y: 0.14 }}
          tracksViewChanges
          zIndex={29}
        >
          <PickupRadarPulse />
        </Marker>
      ) : null}

      {showPickupMarker ? (
        <Marker
          key="pickup-address-pill-v5"
          coordinate={routeStartPoint}
          anchor={resolveEndpointAnchor(startMarkerVariant, showEndpointLabels && Boolean(pickupLabel))}
          tracksViewChanges
          zIndex={30}
        >
          {showEndpointLabels && pickupLabel ? (
            <View style={styles.endpointMarkerRow}>
              {renderEndpointPin(startMarkerVariant)}
              {renderEndpointLabel(
                pickupLabel,
                pickupLabelEditable,
                onPickupLabelPress,
                pickupEtaMinutes,
                pickupMeta,
                "pickup"
              )}
            </View>
          ) : renderEndpointPin(startMarkerVariant)}
        </Marker>
      ) : null}

      {showDropMarker ? (
        <Marker
          key="drop-address-pill-v5"
          coordinate={routeEndPoint}
          anchor={resolveEndpointAnchor(endMarkerVariant, showEndpointLabels && Boolean(dropLabel))}
          tracksViewChanges
          zIndex={31}
        >
          {showEndpointLabels && dropLabel ? (
            <View style={styles.endpointMarkerRow}>
              {renderEndpointPin(endMarkerVariant)}
              {renderEndpointLabel(
                dropLabel,
                dropLabelEditable,
                onDropLabelPress,
                dropEtaMinutes,
                dropMeta,
                "drop"
              )}
            </View>
          ) : renderEndpointPin(endMarkerVariant)}
        </Marker>
      ) : null}

      {showCaptainMarker && captainPoint ? (
        <Marker coordinate={captainPoint} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={styles.captainMarkerWrap}>
            <View style={styles.captainMarkerPulse} />
            <View style={styles.captainMarkerCore} />
          </View>
        </Marker>
      ) : null}

      {nearbyVehicles.map((vehicle, index) => isValidCoordinate(vehicle?.coordinate) ? (
        <NearbyVehicleMapMarker
          key={vehicle.id || `nearby-vehicle-${index}`}
          vehicle={vehicle}
          index={index}
        />
      ) : null)}
      </MapView>

      {mapReadyState === "error" ? (
        <View style={styles.mapErrorState}>
          <MaterialIcons name="map" size={22} color="#334155" />
          <Text style={styles.mapErrorTitle}>Map is unavailable</Text>
          <Text style={styles.mapErrorCopy}>Check your connection and try again.</Text>
        </View>
      ) : null}

      {routeFetchState === "error" && routePath.length < 2 ? (
        <View style={styles.routeErrorState}>
          <View style={styles.routeErrorCopyWrap}>
            <Text style={styles.routeErrorTitle}>Route unavailable</Text>
            <Text style={styles.routeErrorCopy}>We couldn't refresh this route.</Text>
          </View>
          <Pressable onPress={() => setRouteRefreshKey((value) => value + 1)} style={styles.routeRetryButton}>
            <Text style={styles.routeRetryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {captainCoord?.stale ? (
        <View style={styles.trackingStalePill}><Text style={styles.trackingStaleText}>Live location reconnecting…</Text></View>
      ) : null}

      {showStatusBarScrim ? <StatusBarMapScrim /> : null}

      {showMapControls ? (
        <View pointerEvents="box-none" style={styles.mapControls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sync GPS and route"
            onPress={handleGpsSync}
            style={({ pressed }) => [styles.mapControlButton, styles.gpsControlButton, pressed && styles.mapControlPressed]}
          >
            <MaterialIcons name="gps-fixed" size={20} color={ROUTE_BLUE} />
            <View style={styles.syncBadge}>
              <MaterialIcons name="sync" size={9} color="#FFFFFF" />
            </View>
          </Pressable>

          {showZoomControls ? (
            <View style={styles.zoomControlStack}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Zoom in"
                onPress={() => handleZoom("in")}
                style={({ pressed }) => [styles.zoomButton, pressed && styles.mapControlPressed]}
              >
                <MaterialIcons name="add" size={21} color="#111827" />
              </Pressable>
              <View style={styles.zoomDivider} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Zoom out"
                onPress={() => handleZoom("out")}
                style={({ pressed }) => [styles.zoomButton, pressed && styles.mapControlPressed]}
              >
                <MaterialIcons name="remove" size={21} color="#111827" />
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});

const MapsSetupFallback = forwardRef(function MapsSetupFallback(
  { showStatusBarScrim = false, onMapReady },
  ref
) {
  useImperativeHandle(ref, () => ({
    animateToRegion: () => {},
    animateCamera: () => {},
    fitToCoordinates: () => {},
    getCamera: async () => null,
  }), []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => onMapReady?.({ fallback: true }));
    return () => cancelAnimationFrame(frame);
  }, [onMapReady]);

  return (
    <View style={styles.mapsSetupFallback}>
      <Svg width="100%" height="100%" viewBox="0 0 390 720" preserveAspectRatio="xMidYMid slice">
        <Path d="M-20 110 C82 80 104 178 214 148 S336 92 420 122" stroke="#FFFFFF" strokeWidth="18" fill="none" />
        <Path d="M42 -20 C82 126 26 224 98 316 S230 424 190 760" stroke="#FFFFFF" strokeWidth="14" fill="none" />
        <Path d="M286 -20 C244 120 328 202 272 312 S152 500 314 742" stroke="#D9E7F2" strokeWidth="9" fill="none" />
        <Path d="M90 534 C128 472 176 500 218 438 S280 326 318 278" stroke="#1754E8" strokeWidth="5" strokeLinecap="round" fill="none" />
        <Circle cx="90" cy="534" r="11" fill="#1754E8" stroke="#FFFFFF" strokeWidth="4" />
        <Circle cx="318" cy="278" r="11" fill="#E53935" stroke="#FFFFFF" strokeWidth="4" />
      </Svg>
      <View style={styles.mapsSetupMessage}>
        <MaterialIcons name="map" size={20} color="#1754E8" />
        <View style={styles.mapsSetupCopy}>
          <Text style={styles.mapsSetupTitle}>Map setup required</Text>
          <Text style={styles.mapsSetupText}>Ride options remain available while maps are configured.</Text>
        </View>
      </View>
      {showStatusBarScrim ? <StatusBarMapScrim /> : null}
    </View>
  );
});

const RideRouteMap = forwardRef(function RideRouteMap(props, ref) {
  const mapsConfig = Constants.expoConfig?.extra?.nativeMaps || {};
  const nativeMapsConfigured = Platform.OS === "ios"
    ? mapsConfig.iosConfigured === true
    : Platform.OS === "android"
      ? mapsConfig.androidConfigured === true
      : false;

  if (!nativeMapsConfigured) {
    return (
      <MapsSetupFallback
        ref={ref}
        showStatusBarScrim={props.showStatusBarScrim}
        onMapReady={props.onMapReady}
      />
    );
  }

  return <NativeRideRouteMap ref={ref} {...props} />;
});

export default RideRouteMap;

const styles = StyleSheet.create({
  mapsSetupFallback: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    backgroundColor: "#EAF2FA",
  },
  mapsSetupMessage: {
    position: "absolute",
    top: 82,
    left: 18,
    right: 18,
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.96)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  mapsSetupCopy: { flex: 1, minWidth: 0 },
  mapsSetupTitle: { color: "#111827", fontSize: 13, lineHeight: 17, fontWeight: "800" },
  mapsSetupText: { marginTop: 1, color: "#64748B", fontSize: 10.5, lineHeight: 14, fontWeight: "500" },
  mapErrorState: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(244,248,252,0.94)", alignItems: "center", justifyContent: "center", zIndex: 45,
  },
  mapErrorTitle: { marginTop: 8, color: "#111827", fontSize: 15, fontWeight: "700" },
  mapErrorCopy: { marginTop: 3, color: "#64748B", fontSize: 12, fontWeight: "500" },
  routeErrorState: {
    position: "absolute", left: 14, right: 14, bottom: 18, zIndex: 48, backgroundColor: "#FFFFFF",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center",
    shadowColor: "#0F172A", shadowOpacity: 0, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 0,
  },
  routeErrorCopyWrap: { flex: 1 },
  routeErrorTitle: { color: "#111827", fontSize: 13, fontWeight: "700" },
  routeErrorCopy: { marginTop: 2, color: "#64748B", fontSize: 11, fontWeight: "500" },
  routeRetryButton: { backgroundColor: "#111827", borderRadius: 9, paddingHorizontal: 13, paddingVertical: 8 },
  routeRetryText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  trackingStalePill: { position: "absolute", top: 78, alignSelf: "center", zIndex: 47, backgroundColor: "rgba(17,24,39,0.9)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  trackingStaleText: { color: "#FFFFFF", fontSize: 11, fontWeight: "600" },
  statusBarScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 80,
    elevation: 30,
  },
  searchPickupPinSvg: {
    marginLeft: -7,
  },
  searchRadarMarker: {
    width: 124,
    height: 124,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRadarSoftCore: {
    position: "absolute",
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(48,126,217,0.12)",
  },
  searchRadarRing: {
    position: "absolute",
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1.2,
    borderColor: "rgba(48,126,217,0.34)",
    backgroundColor: "rgba(48,126,217,0.08)",
  },
  searchRadarRingInner: {
    position: "absolute",
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1,
    borderColor: "rgba(48,126,217,0.26)",
    backgroundColor: "rgba(48,126,217,0.05)",
  },
  pickupRadarMarker: {
    width: 32,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  pickupRadarRing: {
    position: "absolute",
    width: 26,
    height: 12,
    borderRadius: 13,
    borderWidth: 1.4,
    borderColor: "#1769E8",
    backgroundColor: "rgba(23,105,232,0.06)",
  },
  pickupRadarCore: {
    width: 7,
    height: 4,
    borderRadius: 4,
    backgroundColor: "rgba(23,105,232,0.24)",
  },
  nearbyVehicleMarker: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  nearbyVehicleImage: {
    width: 62,
    height: 62,
  },
  gpsControlButton: {
    marginBottom: 10
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.08)",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0
  },
  mapControlPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }]
  },
  mapControls: {
    position: "absolute",
    right: 14,
    top: 92,
    alignItems: "center",
    zIndex: 60
  },
  syncBadge: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: ROUTE_BLUE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF"
  },
  zoomButton: {
    width: 42,
    height: 39,
    alignItems: "center",
    justifyContent: "center"
  },
  zoomControlStack: {
    width: 44,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.08)",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0
  },
  zoomDivider: {
    height: 1,
    backgroundColor: "rgba(17,24,39,0.08)"
  },
  captainMarkerCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#1754E8",
    borderWidth: 3,
    borderColor: "#FFFFFF"
  },
  captainMarkerPulse: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(23,84,232,0.18)"
  },
  captainMarkerWrap: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center"
  },
  endpointEditBubble: {
    width: 28,
    height: 27,
    marginLeft: 3,
    borderLeftWidth: 1,
    borderLeftColor: "#D7E5FA",
    alignItems: "center",
    justifyContent: "center"
  },
  endpointLabel: {
    width: 164,
    height: 48,
    marginLeft: 0,
    marginTop: 1,
    paddingRight: 4,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 0
  },
  endpointLabelDrop: {
    borderWidth: 0
  },
  endpointLabelPickup: {
    borderWidth: 1,
    borderColor: "#D7E7FF"
  },
  endpointLabelPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }]
  },
  endpointLabelText: {
    color: "#111111",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "800"
  },
  endpointLabelCopy: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 9,
    justifyContent: "center"
  },
  endpointLabelMeta: {
    marginTop: 1,
    color: "#6B7280",
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "600"
  },
  endpointEtaBlock: {
    alignSelf: "stretch",
    width: 48,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    zIndex: 2
  },
  endpointEtaBlockDrop: {
    backgroundColor: "#1769E8"
  },
  endpointEtaBlockPickup: {
    backgroundColor: "#EEF5FF",
    borderLeftWidth: 4,
    borderLeftColor: "#1769E8"
  },
  endpointEtaSlant: {
    position: "absolute",
    right: -7,
    top: -4,
    width: 14,
    height: 56,
    transform: [{ skewX: "14deg" }]
  },
  endpointEtaSlantDrop: {
    backgroundColor: "#1769E8"
  },
  endpointEtaSlantPickup: {
    backgroundColor: "#EEF5FF",
    borderRightWidth: 1,
    borderRightColor: "#C6DAF8"
  },
  endpointEtaValue: {
    fontSize: 19,
    lineHeight: 21,
    fontWeight: "900",
    zIndex: 2
  },
  endpointEtaUnit: {
    marginLeft: 2,
    marginTop: 8,
    fontSize: 8,
    lineHeight: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
    zIndex: 2
  },
  endpointEtaTextDrop: {
    color: "#FFFFFF"
  },
  endpointEtaTextPickup: {
    color: "#1769E8"
  },
  endpointMarkerRow: {
    width: 180,
    height: 78,
    flexDirection: "row",
    alignItems: "flex-start",
    overflow: "visible"
  },
  currentPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1754E8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0
  },
  pickupPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#111111",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0
  },
  dropPin: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#111111",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0
  },
});
