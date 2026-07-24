import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Linking,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker, Polyline } from "react-native-maps";
import Svg, { Rect } from "react-native-svg";
import { io } from "socket.io-client";
import { createGrocerySupportRequest, fetchGroceryOrder, resolvePlatformSocketUrl } from "../../platformApi";
import GroceryCancelOrderScreen from "./GroceryCancelOrderScreen";

const GREEN = "#10A63A";
const INK = "#15181C";
const MUTED = "#69717D";
const BORDER = "#EAECF0";
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const CANCEL_PILL_PERIMETER = 2 * (75 - 33) + Math.PI * 33;

const PREVIEW_ITEMS = [
  { id: "preview-1", name: "Banana Robusta", quantity: 1, unit: "1 kg", price: 48, image: require("../../assets/grocery-products/home-lifestyle/fresh-bananas.png") },
  { id: "preview-2", name: "Amul Taaza Milk", quantity: 1, unit: "500 ml", price: 27, image: require("../../assets/grocery-products/amul-milk.png") },
  { id: "preview-3", name: "Fresh Apples", quantity: 1, unit: "4 pcs", price: 66, image: require("../../assets/grocery-products/home-lifestyle/fresh-apples.png") },
];

function money(value) {
  const amount = Number(value || 0);
  return `₹${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

function imageSource(value) {
  if (!value) return null;
  return typeof value === "string" ? { uri: value } : value;
}

function CancelProgressPill({ seconds, totalSeconds = 60 }) {
  const fraction = Math.max(0, Math.min(1, seconds / totalSeconds));
  const progress = React.useRef(new Animated.Value(fraction)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: fraction,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [fraction, progress]);

  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CANCEL_PILL_PERIMETER, 0],
  });
  const timerText = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <View style={styles.cancelProgressPill}>
      <Svg width="78" height="36" style={StyleSheet.absoluteFillObject}>
        <AnimatedRect
          x="1.5"
          y="1.5"
          width="75"
          height="33"
          rx="16.5"
          fill="#FFFFFF"
          stroke="#F04438"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${CANCEL_PILL_PERIMETER} ${CANCEL_PILL_PERIMETER}`}
          strokeDashoffset={dashOffset}
        />
      </Svg>
      <Text style={styles.cancelTimerText}>{timerText}</Text>
    </View>
  );
}

export default function GroceryOrderTrackingScreen({ orderId, accessToken, initialEta, onClose, onCancelOrder, onRateOrder }) {
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cancellationOpen, setCancellationOpen] = useState(false);
  const [mapTrackingOpen, setMapTrackingOpen] = useState(false);
  const [cancelSeconds, setCancelSeconds] = useState(60);
  const fallbackCancelDeadline = React.useRef(Date.now() + 60000).current;
  const screenReveal = React.useRef(new Animated.Value(0)).current;
  const heroReveal = React.useRef(new Animated.Value(0)).current;
  const statusReveal = React.useRef(new Animated.Value(0)).current;
  const partnerReveal = React.useRef(new Animated.Value(0)).current;
  const itemsReveal = React.useRef(new Animated.Value(0)).current;
  const footerReveal = React.useRef(new Animated.Value(0)).current;
  const mapDragY = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const intro = Animated.stagger(85, [
      Animated.timing(screenReveal, { toValue: 1, duration: 330, useNativeDriver: true }),
      Animated.timing(heroReveal, { toValue: 1, duration: 430, useNativeDriver: true }),
      Animated.spring(statusReveal, { toValue: 1, damping: 17, stiffness: 108, mass: 0.88, useNativeDriver: true }),
      Animated.timing(partnerReveal, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(itemsReveal, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(footerReveal, { toValue: 1, duration: 340, useNativeDriver: true }),
    ]);
    intro.start();
    return () => intro.stop();
  }, [footerReveal, heroReveal, itemsReveal, partnerReveal, screenReveal, statusReveal]);

  const openFullTracking = useCallback(() => {
    Animated.spring(mapDragY, { toValue: 0, damping: 16, stiffness: 160, useNativeDriver: true }).start();
    setMapTrackingOpen(true);
  }, [mapDragY]);

  const mapPanResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderMove: (_, gesture) => mapDragY.setValue(Math.min(0, Math.max(-54, gesture.dy))),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy < -30 || gesture.vy < -0.55) {
        openFullTracking();
        return;
      }
      Animated.spring(mapDragY, { toValue: 0, damping: 15, stiffness: 180, useNativeDriver: true }).start();
    },
    onPanResponderTerminate: () => Animated.spring(mapDragY, { toValue: 0, useNativeDriver: true }).start(),
  }), [mapDragY, openFullTracking]);

  const refresh = useCallback(async () => {
    if (!accessToken || !orderId) {
      setLoading(false);
      return;
    }
    try {
      const next = await fetchGroceryOrder(accessToken, orderId);
      setOrder(next);
      setError("");
    } catch (requestError) {
      setError(requestError?.message || "Live tracking is temporarily unavailable");
    } finally {
      setLoading(false);
    }
  }, [accessToken, orderId]);

  useEffect(() => {
    refresh();
    if (!accessToken || !orderId) return undefined;
    const socket = io(resolvePlatformSocketUrl(), { transports: ["websocket"], auth: { token: accessToken } });
    socket.on("connect", () => socket.emit("join_order", { orderType: "GROCERY", orderId }));
    socket.on("grocery_order_updated", refresh);
    socket.on("partner_location_update", (location) => setOrder((current) => current ? { ...current, partnerLocation: location } : current));
    const poll = setInterval(refresh, 15000);
    return () => {
      clearInterval(poll);
      socket.disconnect();
    };
  }, [accessToken, orderId, refresh]);

  const requestHelp = async () => {
    if (!accessToken || !orderId) {
      Alert.alert("Support", "Live support will connect when this order is synced.");
      return;
    }
    try {
      await createGrocerySupportRequest(accessToken, orderId, { category: "ORDER_HELP", message: "I need help with my active grocery delivery." });
      Alert.alert("We’re on it", "Support will update you shortly.");
    } catch (requestError) {
      Alert.alert("Couldn’t contact support", requestError?.message || "Please try again.");
    }
  };

  const status = String(order?.status || "PACKING").toUpperCase();
  const rawItems = order?.items || order?.orderItems || [];
  const items = (rawItems.length ? rawItems : PREVIEW_ITEMS).map((item, index) => ({
    ...item,
    id: item.id || item.productId || `item-${index}`,
    name: item.product?.name || item.name || "Grocery item",
    image: item.image || item.product?.image,
    quantity: Number(item.quantity || item.qty || 1),
    price: Number(item.price || item.product?.price || 0),
  }));

  const subtotal = Number(order?.subtotal || order?.itemTotal || items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const deliveryFee = Number(order?.deliveryFee || 0);
  const handlingFee = Number(order?.handlingFee || order?.platformFee || 0);
  const discount = Number(order?.discount || order?.discountAmount || 0);
  const total = Number(order?.total || order?.totalAmount || subtotal + deliveryFee + handlingFee - discount) || 609;
  const partner = order?.partner || order?.deliveryPartner || {};
  const partnerName = partner?.user?.fullName || partner?.name || "Ravi Kumar";
  const partnerPhone = partner?.user?.phone || partner?.phone;
  const deliveryInstructions = order?.deliveryInstructions || order?.instructions || "Leave at the door and call on arrival";
  const rawAddress = order?.deliveryAddress?.formattedAddress || order?.deliveryAddress?.addressLine || order?.deliveryAddress || order?.address;
  const deliveryAddress = typeof rawAddress === "string" ? rawAddress : "Home · Saved delivery address";

  const deliveryCoordinate = {
    latitude: Number(order?.deliveryLat || order?.deliveryAddress?.latitude || 17.385),
    longitude: Number(order?.deliveryLng || order?.deliveryAddress?.longitude || 78.4867),
  };
  const store = order?.store || order?.merchant || {};
  const storeCoordinate = {
    latitude: Number(store?.latitude || deliveryCoordinate.latitude + 0.012),
    longitude: Number(store?.longitude || deliveryCoordinate.longitude - 0.01),
  };
  const partnerCoordinate = {
    latitude: Number(order?.partnerLocation?.latitude || storeCoordinate.latitude + 0.005),
    longitude: Number(order?.partnerLocation?.longitude || storeCoordinate.longitude + 0.006),
  };
  const region = useMemo(() => ({
    latitude: (partnerCoordinate.latitude + deliveryCoordinate.latitude) / 2,
    longitude: (partnerCoordinate.longitude + deliveryCoordinate.longitude) / 2,
    latitudeDelta: 0.032,
    longitudeDelta: 0.032,
  }), [partnerCoordinate.latitude, partnerCoordinate.longitude, deliveryCoordinate.latitude, deliveryCoordinate.longitude]);

  const etaText = order?.etaLabel || initialEta || (loading ? "Checking…" : "5 mins");
  const etaMinutes = String(etaText).match(/\d+/)?.[0] || "5";
  const delivered = ["DELIVERED", "COMPLETED", "COMPLETE"].includes(status);
  const onWay = ["PICKED_UP", "OUT_FOR_DELIVERY", "ASSIGNED"].includes(status);
  const statusTitle = delivered ? "Order delivered" : onWay ? "Order is on the way" : "Order is getting packed";
  const statusMessage = delivered
    ? "Delivered safely to your address"
    : onWay
      ? `${partnerName} is heading to your address`
      : "We'll assign a delivery partner soon";
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cancellationBlocked = ["ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED", "COMPLETE", "CANCELLED"].includes(status);

  useEffect(() => {
    if (!onCancelOrder || cancellationBlocked) {
      setCancelSeconds(0);
      return undefined;
    }

    const serverDeadline = Date.parse(order?.cancellableUntil || order?.cancelAllowedUntil || "");
    const createdAt = Date.parse(order?.createdAt || order?.placedAt || "");
    const deadline = Number.isFinite(serverDeadline)
      ? serverDeadline
      : Number.isFinite(createdAt)
        ? createdAt + 60000
        : fallbackCancelDeadline;

    const updateTimer = () => setCancelSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [cancellationBlocked, fallbackCancelDeadline, onCancelOrder, order?.cancelAllowedUntil, order?.cancellableUntil, order?.createdAt, order?.placedAt]);

  const showCancelTimer = Boolean(onCancelOrder && !cancellationBlocked && cancelSeconds > 0);

  const callPartner = () => partnerPhone ? Linking.openURL(`tel:${partnerPhone}`) : requestHelp();
  const openRating = () => onRateOrder?.({ order: delivered ? order : { ...order, status: "DELIVERED" }, items, partnerName });
  const openCancellation = () => {
    setDetailsOpen(false);
    setCancellationOpen(true);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Animated.View style={[styles.orderHeader, { paddingTop: insets.top + 8, opacity: screenReveal, transform: [{ translateY: screenReveal.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] }]}>
        <Pressable style={styles.orderHeaderBack} onPress={onClose} hitSlop={10}><MaterialCommunityIcons name="arrow-left" size={25} color="#252A30" /></Pressable>
        <Text style={styles.orderHeaderTitle}>Order Status</Text>
        <Pressable style={styles.orderHeaderHelp} onPress={requestHelp}><MaterialCommunityIcons name="headset" size={20} color="#252A30" /><Text style={styles.orderHeaderHelpText}>Help</Text></Pressable>
      </Animated.View>

      <ScrollView style={styles.orderScroll} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.orderContent, { paddingBottom: 28 + insets.bottom }]}> 
        <Animated.View style={{ opacity: heroReveal, transform: [{ translateY: heroReveal.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }}>
        <LinearGradient colors={["#162A83", "#19235E", "#14131C"]} style={styles.promoHero}>
          <View style={styles.promoCopy}>
            <Text style={styles.promoTitle}>Buy More{`\n`}Save More</Text>
            <Text style={styles.promoSubtitle}>Fresh essentials at{`\n`}prices you’ll love</Text>
            <Pressable style={styles.buyNowButton} onPress={() => setDetailsOpen(true)}><Text style={styles.buyNowText}>BUY NOW</Text><MaterialCommunityIcons name="chevron-right" size={18} color="#EC4A86" /></Pressable>
          </View>
          <Animated.View style={[styles.heroMapWrap, { transform: [{ translateY: mapDragY }] }]}>
            <MapView style={styles.map} region={region} scrollEnabled={false} zoomEnabled={false} rotateEnabled={false} pitchEnabled={false} toolbarEnabled={false}>
              <Polyline coordinates={[storeCoordinate, partnerCoordinate, deliveryCoordinate]} strokeColor="#2E3550" strokeWidth={3} lineDashPattern={[7, 6]} />
              <Marker coordinate={partnerCoordinate}><View style={styles.heroPartnerMarker}><Text style={styles.heroPartnerLetter}>F</Text></View></Marker>
              <Marker coordinate={deliveryCoordinate}><View style={styles.heroHomeMarker}><MaterialCommunityIcons name="home" size={15} color="#FFFFFF" /></View></Marker>
            </MapView>
            <View style={styles.heroMapGesture} {...mapPanResponder.panHandlers}>
              <Pressable style={styles.heroExpandButton} onPress={openFullTracking}><MaterialCommunityIcons name="arrow-expand" size={17} color={INK} /></Pressable>
            </View>
          </Animated.View>
          <View style={styles.carouselDots}>{[0, 1, 2, 3, 4, 5].map((dot) => <View key={dot} style={[styles.carouselDot, dot === 0 && styles.carouselDotActive]} />)}</View>
        </LinearGradient>
        </Animated.View>

        {error ? <Pressable onPress={refresh} style={styles.liveError}><MaterialCommunityIcons name="wifi-alert" size={17} color="#B54708" /><Text style={styles.liveErrorText}>Live updates paused · Tap to retry</Text></Pressable> : null}

        <Animated.View style={[styles.mainOrderCard, { opacity: statusReveal, transform: [{ translateY: statusReveal.interpolate({ inputRange: [0, 1], outputRange: [34, 0] }) }, { scale: statusReveal.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }) }] }]}> 
          <LinearGradient colors={["#DDEAFF", "#F3F7FF", "#FFFFFF"]} locations={[0, 0.58, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.orderStatusHero}>
            <View style={styles.orderStatusCopy}>
              <Text style={styles.statusPrimary}>{statusTitle}{delivered ? "" : "!"}</Text>
              <Text style={styles.statusMessage}>{statusMessage}</Text>
            </View>
            <LinearGradient colors={delivered ? ["#18A84E", "#087A35"] : ["#18A976", "#087657"]} start={{ x: 0.15, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.etaBadge}>
              {delivered ? <MaterialCommunityIcons name="check-bold" size={29} color="#FFFFFF" /> : <Text style={styles.etaNumber}>{etaMinutes}</Text>}
              <Text style={styles.etaUnit}>{delivered ? "done" : "mins"}</Text>
            </LinearGradient>
          </LinearGradient>
          <Animated.View style={[styles.deliveryPartnerStrip, { opacity: partnerReveal, transform: [{ translateY: partnerReveal.interpolate({ inputRange: [0, 1], outputRange: [13, 0] }) }] }]}> 
            <View style={styles.deliveryPartnerAvatar}><MaterialCommunityIcons name="account" size={27} color={GREEN} /></View>
            <View style={styles.deliveryPartnerCopy}>
              <Text style={styles.deliveryPartnerName} numberOfLines={1}>{partnerName}</Text>
              <View style={styles.deliveryPartnerMetaRow}><MaterialCommunityIcons name="star" size={12} color="#F4B400" /><Text style={styles.deliveryPartnerMeta}>{partner?.rating || "4.8"} · Your delivery partner</Text></View>
            </View>
            <Pressable style={styles.deliveryContactButton} onPress={callPartner}><MaterialCommunityIcons name="phone-outline" size={20} color={GREEN} /></Pressable>
            <Pressable style={styles.deliveryContactButton} onPress={requestHelp}><MaterialCommunityIcons name="message-outline" size={20} color={GREEN} /></Pressable>
          </Animated.View>
          <Animated.View style={{ opacity: itemsReveal, transform: [{ translateY: itemsReveal.interpolate({ inputRange: [0, 1], outputRange: [13, 0] }) }] }}>
          <Pressable style={[styles.orderSummaryStrip, showCancelTimer && styles.orderSummaryStripWithCancel]} onPress={() => setDetailsOpen(true)}>
            <View style={styles.bagIcon}><MaterialCommunityIcons name="shopping-outline" size={23} color="#A64B17" /></View>
            <View style={styles.orderSummaryCopy}>
              <View style={styles.itemsSavedRow}><Text style={styles.itemsCount}>{itemCount} Items</Text><Text style={styles.savedAmount}> · {money(discount || 80)} saved</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#575D68" /></View>
              <Text style={styles.deliveryAddress} numberOfLines={1}>Delivering to home: {deliveryAddress}</Text>
            </View>
          </Pressable>
          {showCancelTimer ? (
            <Pressable style={({ pressed }) => [styles.cancelTimerRow, pressed && styles.cancelTimerRowPressed]} onPress={openCancellation}>
              <View style={styles.cancelTimerIcon}><MaterialCommunityIcons name="close" size={18} color="#D92D20" /></View>
              <View style={styles.cancelTimerCopy}><Text style={styles.cancelTimerTitle}>Cancel order</Text><Text style={styles.cancelTimerSubtitle}>Available briefly after placing your order</Text></View>
              <CancelProgressPill seconds={cancelSeconds} />
            </Pressable>
          ) : null}
          </Animated.View>
        </Animated.View>

        <Animated.View style={{ opacity: footerReveal, transform: [{ translateY: footerReveal.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
        {onRateOrder ? (
          <Pressable style={({ pressed }) => [styles.rateOrderButton, pressed && styles.rateOrderButtonPressed]} onPress={openRating}>
            <MaterialCommunityIcons name="star-outline" size={22} color="#FFFFFF" />
            <Text style={styles.rateOrderButtonText}>Rate order & delivery person</Text>
            {!delivered ? <View style={styles.testBadge}><Text style={styles.testBadgeText}>TEST</Text></View> : <MaterialCommunityIcons name="arrow-right" size={21} color="#FFFFFF" />}
          </Pressable>
        ) : null}

        <Pressable style={styles.orderHelpCard} onPress={requestHelp}>
          <View style={styles.orderHelpIcon}><MaterialCommunityIcons name="message-processing-outline" size={21} color="#E54D91" /></View>
          <View style={styles.orderHelpCopy}><Text style={styles.orderHelpTitle}>Need help with this order?</Text><Text style={styles.orderHelpSubtitle}>Find your issue or reach out via chat</Text></View>
          <MaterialCommunityIcons name="chevron-right" size={23} color="#747A84" />
        </Pressable>
        </Animated.View>
      </ScrollView>

      <Modal visible={mapTrackingOpen} animationType="slide" onRequestClose={() => setMapTrackingOpen(false)} statusBarTranslucent navigationBarTranslucent>
        <View style={styles.fullMapScreen}>
          <StatusBar style="dark" translucent backgroundColor="transparent" />
          <MapView style={StyleSheet.absoluteFillObject} initialRegion={region} showsUserLocation zoomEnabled rotateEnabled pitchEnabled toolbarEnabled={false}>
            <Polyline coordinates={[storeCoordinate, partnerCoordinate, deliveryCoordinate]} strokeColor="#1572DA" strokeWidth={5} />
            <Marker coordinate={storeCoordinate} title="Frezo store"><View style={styles.fullStoreMarker}><MaterialCommunityIcons name="store" size={19} color="#FFFFFF" /></View></Marker>
            <Marker coordinate={partnerCoordinate} title={partnerName}><View style={styles.fullPartnerMarker}><MaterialCommunityIcons name="bike-fast" size={23} color="#FFFFFF" /></View></Marker>
            <Marker coordinate={deliveryCoordinate} title="Delivery address"><View style={styles.fullHomeMarker}><MaterialCommunityIcons name="home" size={20} color="#FFFFFF" /></View></Marker>
          </MapView>
          <View style={[styles.fullMapHeader, { paddingTop: insets.top + 10 }]}>
            <Pressable style={styles.fullMapBack} onPress={() => setMapTrackingOpen(false)}><MaterialCommunityIcons name="arrow-left" size={25} color={INK} /></Pressable>
            <View style={styles.fullMapHeaderCopy}><Text style={styles.fullMapTitle}>Live order tracking</Text><Text style={styles.fullMapSubtitle}>Rider location updates automatically</Text></View>
            <Pressable style={styles.fullMapHelp} onPress={requestHelp}><MaterialCommunityIcons name="headset" size={22} color={GREEN} /></Pressable>
          </View>
          <View style={[styles.fullTrackingCard, { paddingBottom: Math.max(16, insets.bottom + 8) }]}> 
            <View style={styles.fullSheetHandle} />
            <View style={styles.fullStatusRow}>
              <View style={styles.fullStatusIcon}><MaterialCommunityIcons name={onWay ? "bike-fast" : "package-variant-closed"} size={24} color={GREEN} /></View>
              <View style={styles.fullStatusCopy}><Text style={styles.fullStatusTitle}>{statusTitle}</Text><Text style={styles.fullEta}>Arriving in <Text style={styles.fullEtaStrong}>{etaText}</Text></Text></View>
            </View>
            <View style={styles.fullPartnerRow}>
              <View style={styles.fullPartnerAvatar}><MaterialCommunityIcons name="account" size={27} color={GREEN} /></View>
              <View style={styles.fullPartnerCopy}><Text style={styles.fullPartnerName}>{partnerName}</Text><Text style={styles.fullPartnerMeta}>Your delivery partner · Live location</Text></View>
              <Pressable style={styles.fullContactButton} onPress={callPartner}><MaterialCommunityIcons name="phone-outline" size={21} color={GREEN} /></Pressable>
              <Pressable style={styles.fullContactButton} onPress={requestHelp}><MaterialCommunityIcons name="message-outline" size={21} color={GREEN} /></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={detailsOpen} transparent animationType="slide" onRequestClose={() => setDetailsOpen(false)} statusBarTranslucent>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setDetailsOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: Math.max(14, insets.bottom + 8) }]}> 
            <View style={styles.sheetHandle} />
            <LinearGradient colors={["#DDEAFF", "#F3F7FF", "#FFFFFF"]} locations={[0, 0.58, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sheetHeader}>
              <View style={styles.sheetHeaderLeading}>
                <View style={styles.sheetHeaderIcon}><MaterialCommunityIcons name="receipt-text-outline" size={20} color="#285EA8" /></View>
                <View><Text style={styles.sheetTitle}>Order details</Text><View style={styles.sheetStatusRow}><View style={styles.sheetStatusDot} /><Text style={styles.sheetSubtitle}>{statusTitle} · {etaText}</Text></View></View>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setDetailsOpen(false)}><MaterialCommunityIcons name="close" size={22} color={INK} /></Pressable>
            </LinearGradient>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              <View style={styles.partnerRow}>
                <View style={styles.partnerAvatar}><MaterialCommunityIcons name="account" size={27} color={GREEN} /></View>
                <View style={styles.partnerCopy}><Text style={styles.partnerName}>{partnerName}</Text><Text style={styles.partnerMeta}>Your delivery partner</Text></View>
                <Pressable onPress={callPartner} style={styles.contactButton}><MaterialCommunityIcons name="phone-outline" size={21} color={GREEN} /></Pressable>
                <Pressable onPress={requestHelp} style={styles.contactButton}><MaterialCommunityIcons name="message-outline" size={21} color={GREEN} /></Pressable>
              </View>

              <Text style={styles.sheetSectionTitle}>Items in your order</Text>
              <View style={styles.itemsSection}>
              {items.map((item, index) => (
                <View key={item.id} style={[styles.itemRow, index < items.length - 1 && styles.itemRowDivider]}>
                  <View style={styles.itemImageWrap}>{item.image ? <Image source={imageSource(item.image)} style={styles.itemImage} resizeMode="contain" /> : <MaterialCommunityIcons name="food-apple-outline" size={30} color={GREEN} />}</View>
                  <View style={styles.itemCopy}><Text style={styles.itemName} numberOfLines={2}>{item.name}</Text><Text style={styles.itemMeta}>{item.quantity} × {item.unit || "item"}</Text></View>
                  <Text style={styles.itemPrice}>{money(item.price * item.quantity)}</Text>
                </View>
              ))}
              </View>


              <View style={styles.infoRow}>
                <View style={styles.infoIcon}><MaterialCommunityIcons name="note-text-outline" size={20} color={GREEN} /></View>
                <View style={styles.infoCopy}><Text style={styles.infoTitle}>Delivery instructions</Text><Text style={styles.infoSubtitle}>{deliveryInstructions}</Text></View>
              </View>

              <View style={styles.billCard}>
                <Text style={styles.sheetSectionTitle}>Bill summary</Text>
                <View style={styles.billRow}><Text style={styles.billLabel}>Item total</Text><Text style={styles.billValue}>{money(subtotal)}</Text></View>
                <View style={styles.billRow}><Text style={styles.billLabel}>Delivery fee</Text><Text style={styles.billValue}>{deliveryFee ? money(deliveryFee) : "FREE"}</Text></View>
                <View style={styles.billRow}><Text style={styles.billLabel}>Handling fee</Text><Text style={styles.billValue}>{money(handlingFee)}</Text></View>
                {discount > 0 ? <View style={styles.billRow}><Text style={styles.billLabel}>Discount</Text><Text style={styles.savingValue}>−{money(discount)}</Text></View> : null}
                <View style={styles.totalRow}><Text style={styles.totalLabel}>Paid</Text><Text style={styles.totalValue}>{money(total)}</Text></View>
              </View>

              {showCancelTimer && onCancelOrder ? (
                <Pressable style={styles.cancelButton} onPress={openCancellation}>
                  <Text style={styles.cancelText}>Cancel order</Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={cancellationOpen} transparent animationType="fade" onRequestClose={() => setCancellationOpen(false)} statusBarTranslucent presentationStyle="overFullScreen">
        <GroceryCancelOrderScreen
          items={items}
          paymentMethod={order?.paymentMethod || "UPI"}
          onBack={() => setCancellationOpen(false)}
          onCancelled={(result) => {
            setCancellationOpen(false);
            onCancelOrder?.({ ...result, total });
          }}
        />
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F3F1FA" },
  orderHeader: {
    zIndex: 10,
    minHeight: 72,
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E7E9ED",
    flexDirection: "row",
    alignItems: "center",
  },
  orderHeaderBack: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  orderHeaderTitle: {
    flex: 1,
    marginLeft: 7,
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    color: "#20242A",
  },
  orderHeaderHelp: {
    height: 40,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  orderHeaderHelpText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#252A30",
  },
  orderScroll: { flex: 1, backgroundColor: "#F3F1FA" },
  orderContent: { paddingBottom: 28 },
  promoHero: {
    height: 270,
    paddingTop: 45,
    paddingHorizontal: 18,
    overflow: "hidden",
  },
  promoCopy: { width: "51%", zIndex: 2 },
  promoTitle: { fontFamily: "Inter_600SemiBold", fontSize: 20, lineHeight: 25, color: "#FFFFFF", letterSpacing: -0.3 },
  promoSubtitle: { marginTop: 6, fontFamily: "Inter_500Medium", fontSize: 12, lineHeight: 17, color: "rgba(255,255,255,0.88)" },
  buyNowButton: { width: 108, height: 39, borderRadius: 10, marginTop: 12, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, shadowColor: "#000000", shadowOpacity: 0, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 0 },
  buyNowText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#EC4A86", letterSpacing: 0.2 },
  heroMapWrap: {
    position: "absolute",
    width: "52%",
    height: 106,
    right: 18,
    bottom: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
    borderWidth: 3,
    borderBottomWidth: 0,
    borderColor: "rgba(255, 255, 255, 0.72)",
    backgroundColor: "#E9EDF4",
  },
  heroMapGesture: { ...StyleSheet.absoluteFillObject },
  heroExpandButton: { position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.95)", alignItems: "center", justifyContent: "center", elevation: 0 },
  heroPartnerMarker: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#7C24D7", borderWidth: 2, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  heroPartnerLetter: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#FFFFFF" },
  heroHomeMarker: { width: 29, height: 29, borderRadius: 8, backgroundColor: "#344E87", borderWidth: 2, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  carouselDots: { position: "absolute", left: 18, bottom: 17, height: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  carouselDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.65)" },
  carouselDotActive: { width: 35, backgroundColor: "#FFFFFF" },
  liveError: { marginHorizontal: 16, marginTop: 10, borderRadius: 12, backgroundColor: "#FFF4E8", padding: 10, flexDirection: "row", alignItems: "center", gap: 7 },
  liveErrorText: { fontFamily: "Inter_500Medium", fontSize: 11, color: "#B54708" },
  mainOrderCard: {
    marginHorizontal: 10,
    marginTop: -10,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E8EC",
    shadowColor: "#253047",
    shadowOpacity: 0,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 0,
    overflow: "visible",
  },
  orderStatusHero: { minHeight: 146, paddingHorizontal: 20, borderTopLeftRadius: 21, borderTopRightRadius: 21, overflow: "hidden", flexDirection: "row", alignItems: "center" },
  orderStatusCopy: { flex: 1, paddingRight: 17 },
  statusPrimary: { fontFamily: "Inter_600SemiBold", fontSize: 21, lineHeight: 27, color: "#101828", letterSpacing: -0.5 },
  statusMessage: { maxWidth: 235, marginTop: 7, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, color: "#69717D" },
  etaBadge: { width: 78, height: 96, borderRadius: 22, alignItems: "center", justifyContent: "center", shadowColor: "#07513C", shadowOpacity: 0, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 0 },
  etaNumber: { fontFamily: "Inter_600SemiBold", fontSize: 37, lineHeight: 42, color: "#FFFFFF", letterSpacing: -1 },
  etaUnit: { marginTop: 0, fontFamily: "Inter_500Medium", fontSize: 15, color: "rgba(255,255,255,0.94)" },
  deliveryPartnerStrip: {
    minHeight: 72,
    paddingHorizontal: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ECEDEF",
    borderStyle: "dashed",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryPartnerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EDF8F1",
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryPartnerCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  deliveryPartnerName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#20262D",
  },
  deliveryPartnerMetaRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  deliveryPartnerMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: "#737B86",
  },
  deliveryContactButton: {
    width: 36,
    height: 36,
    marginLeft: 7,
    borderRadius: 18,
    backgroundColor: "#F9FCFA",
    alignItems: "center",
    justifyContent: "center",
  },
  orderSummaryStrip: { minHeight: 70, borderTopWidth: 1, borderTopColor: "#E0E3E8", borderStyle: "dashed", borderBottomLeftRadius: 21, borderBottomRightRadius: 21, backgroundColor: "#FFFFFF", paddingHorizontal: 13, flexDirection: "row", alignItems: "center" },
  orderSummaryStripWithCancel: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  bagIcon: { width: 39, height: 44, borderRadius: 12, backgroundColor: "#FFF3DD", alignItems: "center", justifyContent: "center", marginRight: 10 },
  orderSummaryCopy: { flex: 1, minWidth: 0 },
  itemsSavedRow: { flexDirection: "row", alignItems: "center" },
  itemsCount: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#252B34" },
  savedAmount: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#138B67" },
  deliveryAddress: { marginTop: 4, fontFamily: "Inter_400Regular", fontSize: 10.5, color: "#747C87" },
  cancelTimerRow: { minHeight: 58, paddingHorizontal: 13, borderTopWidth: 1, borderTopColor: "#E3DADA", borderStyle: "dashed", borderBottomLeftRadius: 21, borderBottomRightRadius: 21, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  cancelTimerRowPressed: { backgroundColor: "#FFF8F7" },
  cancelTimerIcon: { width: 34, height: 34, marginRight: 9, borderRadius: 17, backgroundColor: "#FFF1F0", alignItems: "center", justifyContent: "center" },
  cancelTimerCopy: { flex: 1, minWidth: 0, paddingRight: 8 },
  cancelTimerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#B42318" },
  cancelTimerSubtitle: { marginTop: 2, fontFamily: "Inter_400Regular", fontSize: 9, color: "#8A7471" },
  cancelProgressPill: { width: 78, height: 36, alignItems: "center", justifyContent: "center" },
  cancelTimerText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#B42318", fontVariant: ["tabular-nums"] },
  orderHelpCard: { minHeight: 70, marginHorizontal: 14, marginTop: 12, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E7E4ED", paddingHorizontal: 13, flexDirection: "row", alignItems: "center", shadowColor: "#514A66", shadowOpacity: 0, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 0 },
  orderHelpIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#FFF0F7", alignItems: "center", justifyContent: "center", marginRight: 10 },
  orderHelpCopy: { flex: 1, minWidth: 0 },
  orderHelpTitle: { fontFamily: "Inter_500Medium", fontSize: 14, color: "#30353F" },
  orderHelpSubtitle: { marginTop: 4, fontFamily: "Inter_400Regular", fontSize: 11, color: "#838995" },
  rateOrderButton: { height: 54, marginHorizontal: 14, marginTop: 12, borderRadius: 15, paddingHorizontal: 16, backgroundColor: GREEN, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  rateOrderButtonPressed: { backgroundColor: "#0B8730", transform: [{ scale: 0.992 }] },
  rateOrderButtonText: { flex: 1, textAlign: "center", fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FFFFFF" },
  testBadge: { height: 24, minWidth: 42, borderRadius: 12, paddingHorizontal: 7, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  testBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 9, letterSpacing: 0.5, color: "#FFFFFF" },
  map: { ...StyleSheet.absoluteFillObject },
  fullMapScreen: { flex: 1, backgroundColor: "#E8ECEF" },
  fullMapHeader: { position: "absolute", left: 0, right: 0, top: 0, minHeight: 92, paddingHorizontal: 16, paddingBottom: 12, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.97)", borderBottomLeftRadius: 22, borderBottomRightRadius: 22, shadowColor: "#101828", shadowOpacity: 0, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 0 },
  fullMapBack: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#F2F4F7", alignItems: "center", justifyContent: "center" },
  fullMapHeaderCopy: { flex: 1, marginLeft: 11 },
  fullMapTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: INK },
  fullMapSubtitle: { fontFamily: "Inter_400Regular", fontSize: 11, color: MUTED, marginTop: 3 },
  fullMapHelp: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#E8F7ED", alignItems: "center", justifyContent: "center" },
  fullTrackingCard: { position: "absolute", left: 12, right: 12, bottom: 12, borderRadius: 22, backgroundColor: "#FFFFFF", paddingHorizontal: 15, paddingTop: 9, shadowColor: "#101828", shadowOpacity: 0, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 0 },
  fullSheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: "#D0D5DD", alignSelf: "center", marginBottom: 10 },
  fullStatusRow: { minHeight: 65, borderRadius: 16, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 10 },
  fullStatusIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#E8F7ED", alignItems: "center", justifyContent: "center" },
  fullStatusCopy: { flex: 1, marginLeft: 11 },
  fullStatusTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: INK },
  fullEta: { fontFamily: "Inter_400Regular", fontSize: 13, color: MUTED, marginTop: 4 },
  fullEtaStrong: { fontFamily: "Inter_600SemiBold", color: GREEN },
  fullPartnerRow: { minHeight: 68, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: BORDER, flexDirection: "row", alignItems: "center" },
  fullPartnerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F0F8F3", alignItems: "center", justifyContent: "center" },
  fullPartnerCopy: { flex: 1, marginLeft: 10 },
  fullPartnerName: { fontFamily: "Inter_500Medium", fontSize: 14, color: INK },
  fullPartnerMeta: { fontFamily: "Inter_400Regular", fontSize: 10, color: MUTED, marginTop: 3 },
  fullContactButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F4F8F5", alignItems: "center", justifyContent: "center", marginLeft: 7 },
  fullStoreMarker: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F2A900", borderWidth: 3, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  fullPartnerMarker: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1572DA", borderWidth: 3, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  fullHomeMarker: { width: 39, height: 39, borderRadius: 20, backgroundColor: GREEN, borderWidth: 3, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.46)", justifyContent: "flex-end" },
  modalDismiss: { flex: 1 },
  sheet: { maxHeight: "78%", backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden", shadowColor: "#0F172A", shadowOpacity: 0, shadowRadius: 20, shadowOffset: { width: 0, height: -7 }, elevation: 0 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#AABBD2", alignSelf: "center", marginTop: 8 },
  sheetHeader: { paddingHorizontal: 14, paddingTop: 9, paddingBottom: 9, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetHeaderLeading: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center" },
  sheetHeaderIcon: { width: 34, height: 34, marginRight: 9, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.76)", alignItems: "center", justifyContent: "center" },
  sheetTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: INK },
  sheetStatusRow: { marginTop: 3, flexDirection: "row", alignItems: "center", gap: 5 },
  sheetStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
  sheetSubtitle: { fontFamily: "Inter_400Regular", fontSize: 10, color: "#657080" },
  closeButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.76)", alignItems: "center", justifyContent: "center" },
  sheetContent: { padding: 8, paddingBottom: 16, gap: 5, backgroundColor: "#FFFFFF" },
  partnerRow: { minHeight: 54, backgroundColor: "#FFFFFF", borderRadius: 11, padding: 7, flexDirection: "row", alignItems: "center" },
  partnerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#EAF7EE", alignItems: "center", justifyContent: "center" },
  partnerCopy: { flex: 1, marginLeft: 8 },
  partnerName: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: INK },
  partnerMeta: { fontFamily: "Inter_400Regular", fontSize: 10, color: MUTED, marginTop: 2 },
  contactButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#F4F8F5", alignItems: "center", justifyContent: "center", marginLeft: 5 },
  sheetSectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#252A30", marginTop: 1, letterSpacing: -0.1 },
  itemsSection: { backgroundColor: "#FFFFFF", borderRadius: 11, paddingHorizontal: 5, overflow: "hidden" },
  itemRow: { minHeight: 50, backgroundColor: "#FFFFFF", paddingVertical: 5, flexDirection: "row", alignItems: "center" },
  itemRowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#ECEFF1" },
  itemImageWrap: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#F5F8F6", alignItems: "center", justifyContent: "center" },
  itemImage: { width: "90%", height: "90%" },
  itemCopy: { flex: 1, marginLeft: 8 },
  itemName: { fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 12, lineHeight: 16, color: INK },
  itemMeta: { fontFamily: "PlusJakartaSans_500Medium", fontSize: 10, color: MUTED, marginTop: 3 },
  itemPrice: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 13, color: INK, marginLeft: 7 },
  infoRow: { minHeight: 50, backgroundColor: "#FFFFFF", borderRadius: 10, padding: 7, flexDirection: "row", alignItems: "center" },
  infoIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#EAF7EE", alignItems: "center", justifyContent: "center" },
  infoCopy: { flex: 1, marginLeft: 8 },
  infoTitle: { fontFamily: "Inter_500Medium", fontSize: 12, color: "#252A30" },
  infoSubtitle: { fontFamily: "Inter_400Regular", fontSize: 10, lineHeight: 14, color: MUTED, marginTop: 2 },
  billCard: { backgroundColor: "#FFFFFF", borderRadius: 11, padding: 9, gap: 5 },
  billRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  billLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: MUTED },
  billValue: { fontFamily: "Inter_500Medium", fontSize: 12, color: INK },
  savingValue: { fontFamily: "Inter_500Medium", fontSize: 12, color: GREEN },
  totalRow: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#DDE4DF", paddingTop: 8, marginTop: 2, flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: INK },
  totalValue: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: INK },
  cancelButton: { height: 44, borderRadius: 12, backgroundColor: "#FFF1F0", alignItems: "center", justifyContent: "center" },
  cancelText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#B42318" },
});
