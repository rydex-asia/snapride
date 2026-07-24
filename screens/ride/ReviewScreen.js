import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const RATING_COPY = {
  1: "Very poor",
  2: "Needs improvement",
  3: "Average trip",
  4: "Good ride",
  5: "Excellent ride",
};

export default function ReviewScreen({ onBack = () => {}, onSkip = () => {}, onSubmit = () => {} }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={10} style={styles.iconButton}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#111111" />
          </Pressable>
          <Text style={styles.headerTitle}>Rate your trip</Text>
          <Pressable onPress={onSkip} hitSlop={10} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.name}>Your captain</Text>
          <Text style={styles.caption}>How was your ride experience?</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((item) => {
              const active = item <= rating;
              return (
                <Pressable key={item} onPress={() => setRating(item)} hitSlop={8} style={styles.starButton}>
                  <MaterialCommunityIcons
                    name={active ? "star" : "star-outline"}
                    size={34}
                    color={active ? "#F4B400" : "#C7CDD6"}
                  />
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.ratingLabel}>{RATING_COPY[rating]}</Text>

          <View style={styles.inputWrap}>
            <TextInput
              value={review}
              onChangeText={setReview}
              multiline
              placeholder="Tell us about the trip"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>

          <Pressable style={styles.submitButton} onPress={() => onSubmit({ rating, review })}>
            <Text style={styles.submitText}>Submit review</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#0B4EDB",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
  },
  caption: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center"
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 0
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28
  },
  headerTitle: {
    color: "#111111",
    fontSize: 22,
    fontWeight: "800"
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  input: {
    minHeight: 120,
    color: "#111111",
    fontSize: 15,
    textAlignVertical: "top"
  },
  inputWrap: {
    marginTop: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFBFC",
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  name: {
    marginTop: 14,
    color: "#111111",
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center"
  },
  ratingLabel: {
    marginTop: 14,
    color: "#111111",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center"
  },
  safe: {
    flex: 1,
    backgroundColor: "#F7F8FA"
  },
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 20,
    paddingTop: 8
  },
  skipButton: {
    minWidth: 40,
    alignItems: "flex-end"
  },
  skipText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "600"
  },
  starButton: {
    paddingHorizontal: 6
  },
  starsRow: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "center"
  },
  submitButton: {
    marginTop: 22,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#0B4EDB",
    alignItems: "center",
    justifyContent: "center"
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700"
  }
});
