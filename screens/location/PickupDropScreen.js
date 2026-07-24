import React from "react";
import { Animated, Easing, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { HYDERABAD_PLACES } from "./hyderabadPlaces";

const DEFAULT_CURRENT_PICKUP = "Current location";
const ADDRESS_INPUT_LIMIT = 30;

const limitAddressInput = (value) =>
  String(value || "").slice(0, ADDRESS_INPUT_LIMIT);

const RECENT_SEARCHES = [
  {
    title: "Nimboliadda",
    subtitle: "Kachiguda, Hyderabad, Telangana 500027, India",
    coordinate: { latitude: 17.3868, longitude: 78.4939 },
  },
  {
    title: "Charlapalli",
    subtitle: "Secunderabad, Telangana, India",
    coordinate: { latitude: 17.4686, longitude: 78.6016 },
  },
  {
    title: "Karmanghat Hanuman Temple",
    subtitle: "Inner Ring Road, Virat Nagar, Champapet, Telangana",
    coordinate: { latitude: 17.3412, longitude: 78.5318 },
  },
  {
    title: "Gayatri Nilayam",
    subtitle: "9-72, Gayatri Nilayam, Gaddiannaram, Vijeta Super Market Road",
    coordinate: { latitude: 17.3668, longitude: 78.5264 },
  },

];

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\broad\s*no\.?\s*/g, "road ")
    .replace(/\bno\.?\s*(\d+)/g, "$1")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function scorePlaceMatch(place, rawQuery) {
  const query = normalizeSearchText(rawQuery);
  const title = normalizeSearchText(place.title);
  const area = normalizeSearchText(place.area);
  const category = normalizeSearchText(place.category);
  const subtitle = normalizeSearchText(place.subtitle);
  const tags = normalizeSearchText((place.tags || []).join(" "));
  const haystack = [title, area, subtitle, category, tags].join(" ");
  const queryTokens = query.split(" ").filter(Boolean);

  if (!query) return 0;
  if (title === query) return 132;
  if (category === query) return 126;
  if (title.startsWith(query)) return 122;
  if (area === query) return 112;
  if (area.startsWith(query)) return 90;
  if (tags.includes(query)) return 74;
  if (title.includes(query)) return 64;
  if (subtitle.includes(query)) return 54;
  if (category.includes(query)) return 40;
  if (queryTokens.length > 1 && queryTokens.every((token) => haystack.includes(token))) return 34;
  return 0;
}

export default function PickupDropScreen({
  onBack,
  onOpenMap,
  onScheduleRide,
  onChooseRide,
  onRouteChange,
  pickupText = DEFAULT_CURRENT_PICKUP,
  dropText = "",
  isResolvingRoute = false,
}) {
  const [pickupValue, setPickupValue] = React.useState(
    limitAddressInput(pickupText || DEFAULT_CURRENT_PICKUP)
  );
  const [dropValue, setDropValue] = React.useState(limitAddressInput(dropText));
  const [stopValue, setStopValue] = React.useState("");
  const [showStopInput, setShowStopInput] = React.useState(false);
  const [activeField, setActiveField] = React.useState(null);
  const [savedRecent, setSavedRecent] = React.useState(() => new Set());
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const pickupInputRef = React.useRef(null);
  const dropInputRef = React.useRef(null);

  const revealAddressStart = (inputRef) => {
    requestAnimationFrame(() => {
      inputRef.current?.setNativeProps?.({ selection: { start: 0, end: 0 } });
    });
  };

  const toggleRecentFavorite = (index) => {
    setSavedRecent((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  React.useEffect(() => {
    setPickupValue(limitAddressInput(pickupText || DEFAULT_CURRENT_PICKUP));
    revealAddressStart(pickupInputRef);
  }, [pickupText]);

  React.useEffect(() => {
    setDropValue(limitAddressInput(dropText));
    revealAddressStart(dropInputRef);
  }, [dropText]);

  React.useEffect(() => {
    if (!isResolvingRoute) {
      progressAnim.stopAnimation();
      progressAnim.setValue(0);
      return undefined;
    }

    const loop = Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1150,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    );

    loop.start();

    return () => loop.stop();
  }, [isResolvingRoute, progressAnim]);

  const progressTranslateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-96, 420],
  });

  const updateRoute = (next) => {
    onRouteChange?.((current) => ({
      ...current,
      ...next,
    }));
  };

  const activeQuery =
    activeField === "pickup" ? pickupValue :
      activeField === "drop" ? dropValue :
        activeField === "stop" ? stopValue : "";

  const placeSuggestions = React.useMemo(() => {
    const query = activeQuery.trim();

    if (!activeField || query.length < 1) {
      return [];
    }

    return HYDERABAD_PLACES
      .map((place) => ({
        place,
        score: scorePlaceMatch(place, query)
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.place.title.localeCompare(b.place.title))
      .slice(0, 6)
      .map((entry) => entry.place);
  }, [activeField, activeQuery]);

  const hasSuggestionQuery = Boolean(activeField && activeQuery.trim().length > 0);

  const formatRecentLocation = (item) => (
    typeof item === "string" ? item : [item.title, item.subtitle].filter(Boolean).join(", ")
  );

  const resolveRecentPlace = (item) => {
    if (item?.coordinate) {
      return {
        title: item.title,
        area: item.subtitle || "Hyderabad",
        subtitle: item.subtitle || "Hyderabad",
        coordinate: item.coordinate,
      };
    }

    const location = formatRecentLocation(item);

    return HYDERABAD_PLACES
      .map((place) => ({ place, score: scorePlaceMatch(place, location) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.place.title.localeCompare(b.place.title))[0]?.place || null;
  };

  const submitRoute = (next = {}) => {
    if (isResolvingRoute) return;

    const nextPickupText = next.pickupText ?? pickupValue ?? DEFAULT_CURRENT_PICKUP;
    const nextDropText = next.dropText ?? dropValue;

    if (!String(nextPickupText || "").trim() || !String(nextDropText || "").trim()) {
      return;
    }

    onChooseRide?.({
      pickupText: nextPickupText,
      dropText: nextDropText,
      stopText: next.stopText ?? stopValue,
      ...(next.pickupCoord ? { pickupCoord: next.pickupCoord } : null),
      ...(next.dropCoord ? { dropCoord: next.dropCoord } : null),
    });
  };

  const selectPlace = (place) => {
    const location = [place.title, place.area, "Hyderabad"].join(", ");

    if (activeField === "pickup") {
      const pickupRoute = { pickupText: location, pickupCoord: place.coordinate };
      setPickupValue(limitAddressInput(location));
      updateRoute(pickupRoute);
      if (String(dropValue || "").trim()) {
        submitRoute(pickupRoute);
      }
    } else if (activeField === "drop") {
      setDropValue(limitAddressInput(location));
      updateRoute({ dropText: location, dropCoord: place.coordinate });
      submitRoute({ dropText: location, dropCoord: place.coordinate });
    } else if (activeField === "stop") {
      setStopValue(location);
    }

    setActiveField(null);
  };


  const selectRecentSearch = (item) => {
    const matchedPlace = resolveRecentPlace(item);
    const matchedCoord = matchedPlace?.coordinate;
    const location = typeof item === "string"
      ? item
      : [item.title, item.subtitle].filter(Boolean).join(", ");
    const targetField = activeField === "pickup" || activeField === "stop" ? activeField : "drop";

    if (targetField === "pickup") {
      const pickupRoute = {
        pickupText: location,
        ...(matchedCoord ? { pickupCoord: matchedCoord } : null),
      };
      setPickupValue(limitAddressInput(location));
      updateRoute(pickupRoute);
      if (String(dropValue || "").trim()) {
        submitRoute(pickupRoute);
      }
    } else if (targetField === "stop") {
      setStopValue(location);
    } else {
      setDropValue(limitAddressInput(location));
      updateRoute({
        dropText: location,
        ...(matchedCoord ? { dropCoord: matchedCoord } : null),
      });
      submitRoute({
        dropText: location,
        ...(matchedCoord ? { dropCoord: matchedCoord } : null),
      });
    }

    setActiveField(null);
  };
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
              <MaterialCommunityIcons name="arrow-left" size={30} color="#111111" />
            </Pressable>
            <Text style={styles.headerTitle}> Choose Your Destination</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardRail}>
              <View style={styles.pickupMarker}>
                <View style={styles.pickupMarkerInner} />
              </View>
              <View style={styles.railLine} />
              <View style={styles.dropMarker}>
                <View style={styles.dropMarkerInner} />
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.pickupBlock}>
                <View style={styles.pickupTopRow}>
                </View>

                <View style={styles.inputRow}>
                  <TextInput
                    ref={pickupInputRef}
                    value={pickupValue}
                    maxLength={ADDRESS_INPUT_LIMIT}
                    onFocus={() => {
                      setActiveField("pickup");
                      revealAddressStart(pickupInputRef);
                    }}
                    onBlur={() => revealAddressStart(pickupInputRef)}
                    onChangeText={(value) => {
                      const limitedValue = limitAddressInput(value);
                      setActiveField("pickup");
                      setPickupValue(limitedValue);
                      updateRoute({ pickupText: limitedValue });
                    }}
                    placeholder="Enter pickup location"
                    placeholderTextColor="#8F969E"
                    style={styles.pickupText}
                    returnKeyType="next"
                  />
                  {pickupValue ? (
                    <Pressable
                      style={styles.clearInputBtn}
                      hitSlop={10}
                      onPress={() => {
                        setPickupValue("");
                        setActiveField(null);
                        updateRoute({ pickupText: "" });
                      }}
                    >
                      <MaterialCommunityIcons name="close-circle-outline" size={18} color="#6B7280" />
                    </Pressable>
                  ) : null}
                </View>
              </View>

              <View style={styles.divider} />

              {showStopInput ? (
                <>
                  <View style={styles.stopRow}>
                    <TextInput
                      value={stopValue}
                      onFocus={() => setActiveField("stop")}
                      maxLength={ADDRESS_INPUT_LIMIT}
                      onChangeText={(value) => {
                        setActiveField("stop");
                        setStopValue(limitAddressInput(value));
                      }}
                      placeholder="Add stop"
                      placeholderTextColor="#8F969E"
                      style={styles.stopText}
                      returnKeyType="next"
                    />
                    <Pressable
                      style={styles.removeStopBtn}
                      hitSlop={10}
                      onPress={() => {
                        setStopValue("");
                        setActiveField(null);
                        setShowStopInput(false);
                      }}
                    >
                      <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
                    </Pressable>
                  </View>
                  <View style={styles.divider} />
                </>
              ) : null}

              <View style={styles.dropRow}>
                <TextInput
                  ref={dropInputRef}
                  value={dropValue}
                  maxLength={ADDRESS_INPUT_LIMIT}
                  onFocus={() => {
                    setActiveField("drop");
                    revealAddressStart(dropInputRef);
                  }}
                  onBlur={() => revealAddressStart(dropInputRef)}
                  onChangeText={(value) => {
                    const limitedValue = limitAddressInput(value);
                    setActiveField("drop");
                    setDropValue(limitedValue);
                    updateRoute({ dropText: limitedValue });
                  }}
                  placeholder="Where are you going?"
                  placeholderTextColor="#8F969E"
                  style={styles.dropText}
                  returnKeyType="search"
                  onSubmitEditing={() => submitRoute()}
                />

                {dropValue ? (
                  <Pressable
                    style={styles.clearInputBtn}
                    hitSlop={10}
                    onPress={() => {
                      setDropValue("");
                      setActiveField(null);
                      updateRoute({ dropText: "" });
                    }}
                  >
                    <MaterialCommunityIcons name="close-circle-outline" size={18} color="#6B7280" />
                  </Pressable>
                ) : null}


              </View>
            </View>
          </View>

          <View style={styles.plannerActionsDock}>
            <Pressable
              style={({ pressed }) => [
                styles.plannerAction,
                showStopInput && styles.plannerActionActive,
                pressed && styles.optionPressed,
              ]}
              onPress={() => {
                setShowStopInput(true);
                setActiveField("stop");
              }}
            >
              <View style={[styles.plannerActionIcon, showStopInput && styles.plannerActionIconActive]}>
                <MaterialCommunityIcons
                  name="plus"
                  size={17}
                  color={showStopInput ? "#7C4C00" : "#42464D"}
                />
              </View>
              <Text style={[styles.optionText, showStopInput && styles.optionTextActive]}>Add stop</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.plannerAction, pressed && styles.optionPressed]}
              onPress={() => onScheduleRide?.()}
            >
              <View style={styles.plannerActionIcon}>
                <MaterialCommunityIcons name="calendar-clock-outline" size={17} color="#42464D" />
              </View>
              <Text style={styles.optionText}>Schedule</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.plannerAction, pressed && styles.optionPressed]}
              onPress={() => onOpenMap?.(activeField === "drop" ? "drop" : "pickup")}
            >
              <View style={styles.plannerActionIcon}>
                <MaterialCommunityIcons name="map-outline" size={17} color="#42464D" />
              </View>
              <Text style={styles.optionText}>Choose map</Text>
            </Pressable>
          </View>

          <View style={styles.routeProgressTrack}>
            <Animated.View
              style={[
                styles.routeProgressFill,
                {
                  opacity: isResolvingRoute ? 1 : 0,
                  transform: [{ translateX: progressTranslateX }],
                },
              ]}
            />
          </View>

          <View style={styles.recentSection}>
            {hasSuggestionQuery ? (
              <Text style={styles.recentHeading}>Search suggestions</Text>
            ) : null}
            <View style={styles.recentCard}>
              {hasSuggestionQuery ? (
                placeSuggestions.length > 0 ? (
                  placeSuggestions.map((place, index) => (
                    <Pressable
                      key={place.id}
                      style={({ pressed }) => [
                        styles.suggestionRow,
                        index > 0 && styles.recentRowBorder,
                        pressed && styles.rowPressed
                      ]}
                      onPress={() => selectPlace(place)}
                    >
                      <View style={styles.suggestionIcon}>
                        <MaterialCommunityIcons name={place.icon || "map-marker-radius"} size={16} color="#0E7C66" />
                      </View>
                      <View style={styles.suggestionCopy}>
                        <Text style={styles.suggestionTitle} numberOfLines={1}>{place.title}</Text>
                        <Text style={styles.suggestionSubtitle} numberOfLines={1}>{place.subtitle}</Text>
                      </View>
                      <Text style={styles.suggestionTag} numberOfLines={1}>{place.category}</Text>
                    </Pressable>
                  ))
                ) : (
                  <View style={styles.emptySuggestionRow}>
                    <MaterialCommunityIcons name="map-search-outline" size={18} color="#98A2B3" />
                    <Text style={styles.emptySuggestionText}>No Hyderabad places found</Text>
                  </View>
                )
              ) : (
                RECENT_SEARCHES.map((item, index) => {
                  const title = typeof item === "string" ? item.split(",")[0] : item.title;
                  const subtitle = typeof item === "string"
                    ? item.split(",").slice(1).join(",").trim() || item
                    : item.subtitle;

                  return (
                    <Pressable
                      key={`${title}-${index}`}
                      style={({ pressed }) => [
                        styles.recentRow,
                        index > 0 && styles.recentRowBorder,
                        pressed && styles.rowPressed
                      ]}
                      onPress={() => selectRecentSearch(item)}
                    >
                      <MaterialCommunityIcons name="history" size={23} color="#5F6875" />
                      <View style={styles.recentCopy}>
                        <Text style={styles.recentTitle} numberOfLines={1} ellipsizeMode="tail">
                          {title}
                        </Text>
                        <Text style={styles.recentSubtitle} numberOfLines={1} ellipsizeMode="tail">
                          {subtitle}
                        </Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={savedRecent.has(index) ? `Remove ${title} from favorites` : `Save ${title} to favorites`}
                        hitSlop={8}
                        onPress={(event) => {
                          event.stopPropagation();
                          toggleRecentFavorite(index);
                        }}
                        style={({ pressed }) => [
                          styles.recentSaveButton,
                          savedRecent.has(index) && styles.recentSaveButtonActive,
                          pressed && styles.recentSaveButtonPressed,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={savedRecent.has(index) ? "heart" : "heart-outline"}
                          size={18}
                          color={savedRecent.has(index) ? "#D73A49" : "#626A75"}
                        />
                      </Pressable>
                    </Pressable>
                  );
                })
              )}
            </View>
          </View>
        </View>
        <View pointerEvents="none" style={styles.bottomEdgeStrip} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  plannerActionsDock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 9,
    marginHorizontal: 20,
    minHeight: 48,
  },
  plannerAction: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 5,
    borderRadius: 14,
    backgroundColor: "#F2F3F5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  plannerActionActive: {
    backgroundColor: "#FFF4D6",
  },
  plannerActionIcon: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  plannerActionIconActive: {
    backgroundColor: "#FFE5A3",
  },
  bottomEdgeStrip: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    backgroundColor: "#FFFFFF"
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 22,
    marginLeft: 20,
    marginRight: 42,
    minHeight: 82,
    paddingTop: 0,
    paddingRight: 4,
    paddingBottom: 0,
    paddingLeft: 4,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#505050ff",
    shadowColor: "#323232ff",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0
  },
  cardBody: {
    flex: 1,elevation: 0
  },
  cardRail: {
    width: 28,
    alignItems: "center",
    justifyContent: "flex-start",
    alignSelf: "stretch",
    marginRight: 6,
    paddingTop: 15,
    paddingBottom: 13
  },
  clearInputBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 46
  },
  divider: {
    height: 0.5,
    backgroundColor: "#e4e4e4ff",
    marginTop: 3,
    marginBottom: 3,
    right: 10
  },
  dropMarker: {
    width: 11,
    height: 11,
    borderRadius: 2,
    backgroundColor: "#F40606",
    borderWidth: 1.5,
    borderColor: "#C81E1E",
    alignItems: "center",
    justifyContent: "center"
  },
  dropMarkerInner: {
    width: 3.5,
    height: 3.5,
    borderRadius: 1,
    backgroundColor: "#FFFFFF"
  },
  dropRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  dropText: {
    flex: 1,
    color: "#000000ff",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.15,
    paddingRight: 12
  },
  emptySuggestionRow: {
    minHeight: 56,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  emptySuggestionText: {
    color: "#667085",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700"
  },
  rowPressed: {
    backgroundColor: "#F7FAFC"
  },
  suggestionCopy: {
    flex: 1,
    minWidth: 0
  },
  suggestionIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#EAF7F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  suggestionRow: {
    minHeight: 58,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center"
  },
  suggestionSubtitle: {
    marginTop: 2,
    color: "#8A94A3",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600"
  },
  suggestionTag: {
    maxWidth: 82,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
    color: "#667085",
    backgroundColor: "#F2F4F7",
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "800"
  },
  suggestionTitle: {
    color: "#101828",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800"
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 6
  },
  headerTitle: {
    flex: 1,
    color: "#111111",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "600",
    letterSpacing: -0.2
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  optionPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.985 }]
  },
  optionText: {
    color: "#42464D",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
    letterSpacing: -0.05
  },
  optionTextActive: {
    color: "#7C4C00"
  },
  routeProgressTrack: {
    height: 1,
    marginTop: 9,
    marginHorizontal: 0,
    marginBottom: 3,
    overflow: "hidden",
    backgroundColor: "#F0F3F6"
  },
  routeProgressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 82,
    height: "100%",
    borderRadius: 1,
    backgroundColor: "#77A9CB"
  },
  pickupBlock: {
    paddingTop: 0
  },
  pickupLabel: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    color: "#000000ff",
    marginLeft: 2
  },
  pickupMarker: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#0E7C66",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF"
  },
  pickupMarkerInner: {
    width: 4,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#FFFFFF"
  },
  pickupText: {
    flex: 1,
    marginTop: 3,
    color: "#000000ff",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.15,
    paddingRight: 6
  },
  pickupTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  railLine: {
    width: 2,
    minHeight: 31,
    flex: 1,
    borderRadius: 999,
    marginVertical: 5,
    backgroundColor: "#111111"
  },
  recentCard: {
    backgroundColor: "#FFFFFF"
  },
  recentHeading: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "800",
    marginBottom: 10
  },
  recentCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12
  },
  recentRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    gap: 12
  },
  recentRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "#D6DAE0",
    borderStyle: "dashed"
  },
  recentSaveButton: {
    width: 29,
    height: 29,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F5"
  },
  recentSaveButtonActive: {
    backgroundColor: "#FFF0F1"
  },
  recentSaveButtonPressed: {
    opacity: 0.68,
    transform: [{ scale: 0.92 }]
  },
  recentSection: {
    marginTop: 4,
    paddingHorizontal: 12
  },
  recentSubtitle: {
    marginTop: 3,
    color: "#5F6875",
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: "500"
  },
  recentTitle: {
    color: "#0B0D12",
    fontSize: 14.5,
    lineHeight: 18,
    fontWeight: "800",
    letterSpacing: -0.15
  },
  removeStopBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  stopRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  stopText: {
    flex: 1,
    color: "#111111",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.15,
    paddingRight: 12
  }
});
