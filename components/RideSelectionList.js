import React, { memo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import RideSelectionCard from "./RideSelectionCard";

function RideSelectionList({
  data,
  selectedRideKey,
  expandedRideKey,
  favoriteRideKeys = [],
  onSelectRide,
  onFavoriteRide,
  onDismissRide,
  contentContainerStyle,
  style,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
}) {
  const favoriteSet = new Set(favoriteRideKeys);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.key}
      showsVerticalScrollIndicator={false}
      style={style}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={
        ListEmptyComponent || (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No rides available</Text>
            <Text style={styles.emptySub}>Try a different location or restore a hidden ride.</Text>
          </View>
        )
      }
      renderItem={({ item, index }) => (
        <RideSelectionCard
          ride={item}
          index={index}
          selected={item.key === selectedRideKey}
          expanded={item.key === expandedRideKey}
          favorite={favoriteSet.has(item.key)}
          onPress={onSelectRide}
          onFavorite={onFavoriteRide}
          onDismiss={onDismissRide}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

export default memo(RideSelectionList);

const styles = StyleSheet.create({
  content: {
    paddingBottom: 12,
  },
  separator: {
    height: 10,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 4,
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
  },
  emptySub: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});
