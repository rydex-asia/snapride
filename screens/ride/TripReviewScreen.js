import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import AccountPageHeader from "../../components/AccountPageHeader";

const feedbackOptions = ["Safe", "Clean", "Polite", "On time", "Smooth route", "Fair fare"];

const ratingCopy = {
  1: { title: "Poor", text: "Tell us what went wrong." },
  2: { title: "Not great", text: "We will work on this." },
  3: { title: "Okay", text: "Thanks, we can do better." },
  4: { title: "Good", text: "Glad the ride worked well." },
  5: { title: "Excellent", text: "Happy to hear the ride was smooth." },
};

export default function TripReviewScreen({
  onBack = () => {},
  onSkip = () => {},
  onSubmit = () => {},
  captainName = "Manoj Kumar",
  captainPlate = "TG08ET3421",
  captainVehicle = "Bajaj Pulsar 125",
  fare = "₹60",
}) {
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(["Safe"]);
  const [review, setReview] = useState("");

  const copy = useMemo(() => ratingCopy[rating], [rating]);

  const toggleTag = (label) => {
    setSelectedTags((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label]
    );
  };

  const handleSubmit = () => {
    onSubmit({ rating, tags: selectedTags, review });
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="dark" />

      <AccountPageHeader title="Review trip" subtitle="Trip completed" onBack={onBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.tripPanel}>
          <View style={styles.tripTopRow}>
            <View style={styles.completedBadge}>
              <View style={styles.completedIcon}>
                <MaterialIcons name="done" size={15} color="#FFFFFF" />
              </View>
              <Text style={styles.completedBadgeText}>Trip completed</Text>
            </View>
            <View style={styles.fareWrap}>
              <Text style={styles.fareLabel}>Total fare</Text>
              <Text style={styles.fareText}>{fare}</Text>
            </View>
          </View>

          <View style={styles.tripDivider} />

          <View style={styles.captainRow}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={34} color="#24272D" />
            </View>
            <View style={styles.captainTextWrap}>
              <Text style={styles.captainName}>{captainName}</Text>
              <Text style={styles.captainMeta}>{captainVehicle}</Text>
              <Text style={styles.plateText}>{captainPlate}</Text>
            </View>
            <View style={styles.safeBadge}>
              <MaterialIcons name="verified-user" size={16} color="#0B5BEA" />
              <Text style={styles.safeBadgeText}>Verified</Text>
            </View>
          </View>
        </View>

        <View style={styles.ratingBlock}>
          <View style={styles.ratingCopyWrap}>
            <Text style={styles.ratingEyebrow}>Rider rating</Text>
            <Text style={styles.ratingTitle}>{copy.title}</Text>
            <Text style={styles.ratingSubtitle}>{copy.text}</Text>
          </View>

          <View style={styles.starsShell}>
            {[1, 2, 3, 4, 5].map((item) => {
              const active = item <= rating;
              return (
                <Pressable key={item} onPress={() => setRating(item)} style={styles.starButton} hitSlop={8}>
                  <MaterialIcons
                    name={active ? "star" : "star-border"}
                    size={36}
                    color={active ? "#FFC328" : "#CBD1DC"}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.feedbackWrap}>
          <View style={styles.feedbackHeaderRow}>
            <Text style={styles.feedbackTitle}>Quick feedback</Text>
            <Text style={styles.optionalText}>Optional</Text>
          </View>

          <View style={styles.chipsRow}>
            {feedbackOptions.map((label) => {
              const active = selectedTags.includes(label);
              return (
                <Pressable
                  key={label}
                  onPress={() => toggleTag(label)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.noteBox}>
            <TextInput
              value={review}
              onChangeText={setReview}
              multiline
              placeholder="Add a short note"
              placeholderTextColor="#8B929E"
              style={styles.reviewInput}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.skipFooterButton} onPress={onSkip} hitSlop={8}>
          <Text style={styles.skipFooterText}>Skip for now</Text>
        </Pressable>
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit review</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#EEF1F5",
    alignItems: "center",
    justifyContent: "center"
  },
  captainMeta: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: "#5F6672"
  },
  captainName: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
    color: "#111214"
  },
  captainRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  captainTextWrap: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0
  },
  chip: {
    minHeight: 39,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7EAF0",
    alignItems: "center",
    justifyContent: "center"
  },
  chipActive: {
    backgroundColor: "#EAF1FF",
    borderColor: "#BBD0FF"
  },
  chipsRow: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9
  },
  chipText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4F5662"
  },
  chipTextActive: {
    color: "#0B5BEA"
  },
  completedBadge: {
    height: 34,
    borderRadius: 17,
    paddingLeft: 5,
    paddingRight: 12,
    backgroundColor: "#EAF7EF",
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  completedBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    color: "#087443"
  },
  completedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#159447",
    alignItems: "center",
    justifyContent: "center"
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 126
  },
  fareLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: "#8A919E",
    textTransform: "uppercase",
    letterSpacing: 0.45
  },
  fareText: {
    marginTop: 1,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
    color: "#111214"
  },
  fareWrap: {
    alignItems: "flex-end"
  },
  feedbackHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  feedbackTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
    color: "#111214"
  },
  feedbackWrap: {
    marginTop: 22,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E7EAF0"
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 30,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E7EAF0",
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  noteBox: {
    marginTop: 16,
    minHeight: 98,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7EAF0",
    paddingHorizontal: 15,
    paddingVertical: 13
  },
  optionalText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#9AA1AD"
  },
  plateText: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    color: "#89909C"
  },
  ratingBlock: {
    marginTop: 12,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: "#ECEFF4"
  },
  ratingCopyWrap: {
    alignItems: "center"
  },
  ratingEyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    color: "#0B5BEA",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  ratingSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: "#68707D",
    textAlign: "center"
  },
  ratingTitle: {
    marginTop: 7,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    color: "#111214"
  },
  reviewInput: {
    minHeight: 72,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#111214"
  },
  safeBadge: {
    height: 31,
    borderRadius: 16,
    paddingHorizontal: 9,
    backgroundColor: "#EDF3FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  safeBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    color: "#0B5BEA"
  },
  screen: {
    flex: 1,
    backgroundColor: "#F6F8FC"
  },
  skipFooterButton: {
    height: 44,
    minWidth: 108,
    borderRadius: 28,
    paddingHorizontal: 16,
    backgroundColor: "#e6e6e6ff",
    alignItems: "center",
    justifyContent: "center"
  },
  skipFooterText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
    color: "#626A76"
  },
  starButton: {
    width: 45,
    height: 48,
    alignItems: "center",
    justifyContent: "center"
  },
  starsShell: {
    marginTop: 18,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F6F8FC",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8
  },
  submitButton: {
    flex: 1,
    height: 44,
    borderRadius: 28,
    backgroundColor: "#111214",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  submitText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF"
  },
  tripDivider: {
    height: 1,
    marginVertical: 13,
    backgroundColor: "#ECEEF2"
  },
  tripPanel: {
    minHeight: 158,
    borderRadius: 24,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E8EF"
  },
  tripTopRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});
