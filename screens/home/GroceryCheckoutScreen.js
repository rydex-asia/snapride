import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import AppIcon from "../../components/AppIcon";
import AddSquareIcon from "../../components/AddSquareIcon";
import { GROCERY_TYPOGRAPHY } from "../../theme/typography";
import { withReadableGroceryTypography } from "./groceryReadableTypography";

const BLUE = "#138A36";
const GREEN = "#129B72";
const PAGE_BG = "#F5F6F8";

const SIMILAR_PRODUCTS = [
  { id: "f1", name: "Bingo Mad Angles Achari Masti", brand: "BINGO", qty: "64 g", price: 17, mrp: 20, color: "#FFE6DB", discount: "15% OFF", stock: "High demand" },
  { id: "f2", name: "Kurkure Namkeen Playz Puffcorn", brand: "KURKURE", qty: "52 g", price: 20, mrp: 24, color: "#E8F6DC", discount: "17% OFF" },
  { id: "f3", name: "Jamun (Neredu Pandu)", brand: "FRESH", qty: "200 g", price: 41, mrp: 61, color: "#EDF2FF", discount: "32% OFF" },
];

const PEOPLE_ALSO_BOUGHT = [
  { id: "s1", name: "PapaNata Blueberry Drink", brand: "PAPANATA", qty: "320 ml", price: 60, mrp: 70, color: "#DDF2FF", discount: "14% OFF" },
  { id: "s2", name: "PapaNata Greenapple Drink", brand: "PAPANATA", qty: "320 ml", price: 60, mrp: 70, color: "#E7F8DE", discount: "14% OFF" },
  { id: "s3", name: "PapaNata Lychee Drink", brand: "PAPANATA", qty: "320 ml", price: 60, mrp: 70, color: "#FFE6EE", discount: "14% OFF" },
];

function money(value) {
  return `₹${value}`;
}

function unitPrice(item) {
  const match = String(item.qty || "").match(/([\d.]+)\s*(kg|g|l|ml)/i);
  if (!match) return "";
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (!amount) return "";

  const baseAmount = unit === "kg" || unit === "l" ? amount * 1000 : amount;
  const baseUnit = unit === "kg" || unit === "g" ? "g" : "ml";
  const pricePerHundred = (Number(item.price) / baseAmount) * 100;
  const formatted = Number.isInteger(pricePerHundred) ? pricePerHundred : pricePerHundred.toFixed(1);
  return `₹${formatted}/100 ${baseUnit}`;
}

function QuantityStepper({ value, onChange }) {
  return (
    <View style={styles.stepper}>
      <Pressable style={styles.stepperButton} onPress={() => onChange(Math.max(0, value - 1))}>
        <Text style={styles.stepperText}>-</Text>
      </Pressable>
      <Text style={styles.stepperValue}>{value}</Text>
      <Pressable style={styles.stepperButton} onPress={() => onChange(value + 1)}>
        <Text style={styles.stepperText}>+</Text>
      </Pressable>
    </View>
  );
}

function RailCard({ item, quantity, onChangeQuantity }) {
  const saveAmount = Math.max(0, Number(item.mrp || item.price) - Number(item.price));
  const discount = item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <View style={styles.railCard}>
      <View style={[styles.railVisual, { backgroundColor: item.color || "#F7F2EA" }]}>
        {discount > 0 ? (
          <View style={styles.railDiscountBadge}>
            <Text style={styles.railDiscountText}>{discount}%{`\n`}OFF</Text>
          </View>
        ) : null}
        <Pressable
          style={styles.railHeartButton}
          onPress={() => setWishlisted((current) => !current)}
          hitSlop={6}
        >
          <MaterialCommunityIcons
            name={wishlisted ? "heart" : "heart-outline"}
            size={19}
            color="#C81924"
          />
        </Pressable>
        {quantity > 0 ? (
          <View style={styles.railAddStepper}>
            <Pressable style={styles.railAddStepperButton} onPress={() => onChangeQuantity(item.id, quantity - 1)}>
              <Text style={styles.railAddStepperText}>−</Text>
            </Pressable>
            <Text style={styles.railAddStepperValue}>{quantity}</Text>
            <Pressable style={styles.railAddStepperButton} onPress={() => onChangeQuantity(item.id, quantity + 1)}>
              <Text style={styles.railAddStepperText}>+</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.railAddButton} onPress={() => onChangeQuantity(item.id, 1)}>
            <MaterialCommunityIcons name="plus" size={21} color={BLUE} />
          </Pressable>
        )}

        {item.image ? (
          <Image source={item.image} style={styles.railProductImage} resizeMode="contain" />
        ) : (
          <View style={[styles.railVisualPlate, { backgroundColor: item.color }]}> 
            <Text style={styles.railVisualText} numberOfLines={2}>{item.name.split(" ").slice(0, 2).join(" ")}</Text>
          </View>
        )}

        <View style={styles.railVegMark}>
          <View style={styles.railVegDot} />
        </View>
      </View>
      <View style={styles.railInfo}>
        <View style={styles.railMetaRow}>
          <View style={styles.railRatingGroup}>
            <MaterialCommunityIcons name="star" size={11} color={GREEN} />
            <Text style={styles.railRatingText}>4.7</Text>
          </View>
          <Text style={styles.railReviewText}>• 9 MINS</Text>
        </View>
        <Text style={styles.railName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.railQtyText}>{item.qty}</Text>
        <View style={styles.railInfoDivider} />
        <View style={styles.railPriceStack}>
          <Text style={styles.railPrice}>{money(item.price)}</Text>
          {item.mrp ? <Text style={styles.railMrp}>{money(item.mrp)}</Text> : null}
        </View>
        {saveAmount > 0 ? (
          <Text style={styles.railOffer}>{discount}% OFF · Save ₹{saveAmount}</Text>
        ) : null}
      </View>
    </View>
  );
}

function ProductRail({ title, subtitle, items, quantities, onChangeQuantity }) {
  return (
    <View style={styles.railSection}>
      <View style={styles.railTitleRow}>
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railContent}>
        {items.map((item) => (
          <RailCard
            key={item.id}
            item={item}
            quantity={quantities[item.id] || 0}
            onChangeQuantity={onChangeQuantity}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function BillLine({ label, value, oldValue, bold, helper }) {
  return (
    <View style={styles.billLineWrap}>
      <View style={styles.billLine}>
        <Text style={[styles.billLabel, bold && styles.billLabelBold]}>{label}</Text>
        <View style={styles.billValues}>
          {oldValue ? <Text style={styles.billOldValue}>{oldValue}</Text> : null}
          <Text style={[styles.billValue, bold && styles.billValueBold]}>{value}</Text>
        </View>
      </View>
      {helper ? <Text style={styles.billHelper}>{helper}</Text> : null}
    </View>
  );
}

function EmptyCart({ onClose }) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    StatusBar.setBarStyle("dark-content", true);
    StatusBar.setTranslucent?.(true);
    StatusBar.setBackgroundColor?.("transparent", true);
  }, []);

  return (
    <SafeAreaView style={styles.emptySafe} edges={["bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent animated />
      <View style={[styles.statusBarCover, { height: insets.top }]} />
      <Pressable style={styles.emptyBack} onPress={onClose} hitSlop={12}>
        <AppIcon name="back" size={28} color="#3A3D42" />
      </Pressable>
      <View style={styles.emptyContent}>
        <View style={styles.emptyBowls}>
          <View style={[styles.emptyBowl, styles.emptyBowlBack]} />
          <View style={[styles.emptyBowl, styles.emptyBowlMid]} />
          <View style={styles.emptyBowl} />
          <View style={styles.tomato} />
        </View>
        <Text style={styles.emptyTitle}>Your cart is getting lonely</Text>
        <Text style={styles.emptySubtitle}>Fill it up with all things good!</Text>
        <Pressable style={styles.startShoppingButton} onPress={onClose}>
          <Text style={styles.startShoppingText}>Start Shopping</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function GroceryCheckoutScreen({
  product,
  unit,
  quantity = 1,
  items = [],
  onClose,
  onChangePayment,
  onItemsChange,
  onQuantityChange,
  onOpenCoupons,
  appliedCoupon,
  deliveryAddress = "Current location",
  deliveryEta = "Checking…",
}) {
  const insets = useSafeAreaInsets();
  const [cartItems, setCartItems] = useState(() => {
    if (items.length) {
      return items.map((item) => ({ ...item, quantity: Math.max(0, Number(item.quantity) || 0) }));
    }
    return product ? [{ product, quantity: Math.max(0, Number(quantity) || 0), unit }] : [];
  });
  const [railQuantities, setRailQuantities] = useState({});
  const [tip, setTip] = useState(10);
  const onItemsChangeRef = useRef(onItemsChange);
  const onQuantityChangeRef = useRef(onQuantityChange);
  onItemsChangeRef.current = onItemsChange;
  onQuantityChangeRef.current = onQuantityChange;

  const mainQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const itemTotal = cartItems.reduce((sum, item) => sum + Number(item.unit?.price || item.product?.price || 0) * item.quantity, 0);
  const mrpTotal = cartItems.reduce((sum, item) => sum + Number(item.unit?.mrp || item.product?.mrp || item.unit?.price || item.product?.price || 0) * item.quantity, 0);
  const handling = 8;
  const smallCartFee = itemTotal >= 99 ? 0 : 20;
  const deliveryFee = 0;
  const couponDiscount = appliedCoupon
    ? Math.min(
      Number(appliedCoupon.maxDiscount || itemTotal),
      appliedCoupon.discountType === "percent"
        ? Math.round(itemTotal * Number(appliedCoupon.discountValue || 0) / 100)
        : Number(appliedCoupon.discountValue || 0)
    )
    : 0;
  const toPay = Math.max(0, itemTotal + handling + smallCartFee + tip + deliveryFee - couponDiscount);
  const saved = Math.max(6, mrpTotal - itemTotal + couponDiscount + 6);

  const isCartEmpty = mainQuantity <= 0;

  const stickyMethod = useMemo(() => (toPay > 150 ? "Paytm UPI" : "CRED UPI"), [toPay]);

  const changeRailQuantity = (id, nextQuantity) => {
    setRailQuantities((current) => ({ ...current, [id]: Math.max(0, nextQuantity) }));
  };

  const changeCartQuantity = (id, nextQuantity) => {
    setCartItems((current) => {
      const changedItem = current.find((item, index) => (item.product?.id || `cart-${index}`) === id);
      const safeQuantity = Math.max(0, nextQuantity);
      onQuantityChangeRef.current?.(changedItem?.product, safeQuantity);
      return current
        .map((item, index) => ((item.product?.id || `cart-${index}`) === id
          ? { ...item, quantity: safeQuantity }
          : item))
        .filter((item) => item.quantity > 0);
    });
  };

  useEffect(() => {
    StatusBar.setBarStyle("dark-content", true);
    StatusBar.setTranslucent?.(true);
    StatusBar.setBackgroundColor?.("transparent", true);
  }, []);

  useEffect(() => {
    onItemsChangeRef.current?.(cartItems);
  }, [cartItems]);

  if (isCartEmpty) {
    return <EmptyCart onClose={onClose} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent animated />
      <View style={[styles.statusBarCover, { height: insets.top }]} />
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Pressable style={styles.headerBack} onPress={onClose} hitSlop={10}>
              <AppIcon name="back" size={25} color="#5E636B" />
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.checkoutSubtitle}>{deliveryEta}</Text>
              <View style={styles.checkoutAddressRow}>
                <Text style={styles.checkoutAddress} numberOfLines={1}>Deliver to: {deliveryAddress}</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#20242A" />
              </View>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.headerActionButton} hitSlop={8}>
                <MaterialCommunityIcons name="share-variant-outline" size={27} color="#20242A" />
              </Pressable>
              <Pressable style={styles.headerActionButton} hitSlop={8}>
                <MaterialCommunityIcons name="dots-vertical" size={25} color="#20242A" />
              </Pressable>
            </View>
          </View>
          <ExpoLinearGradient colors={["#79C983", "#14911C", "#B3EBB8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.headerSavingsPill}>
            <Text style={styles.headerSavingsText}>₹{Math.round(saved)} saved ! on your delivery</Text>
          </ExpoLinearGradient>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          <View style={styles.cartCard}>
            <View style={styles.cartCardTop}>
              <Text style={styles.cartSectionTitle}>Delivery in <Text style={styles.cartSectionEta}>{deliveryEta}</Text></Text>
              <Text style={styles.itemCount}>{mainQuantity} Item</Text>
            </View>
            <View style={styles.dashedDivider} />
            {cartItems.map((item, index) => {
              const cartProduct = item.product || {};
              const cartId = cartProduct.id || `cart-${index}`;
              const cartName = cartProduct.name || "Grocery item";
              const cartQty = item.unit?.qty || cartProduct.qty || "1 pack";
              const rowPrice = Number(item.unit?.price || cartProduct.price || 0) * item.quantity;
              return (
                <View key={cartId} style={styles.cartItemRow}>
                  <View style={styles.cartVisual}>
                    {cartProduct.image ? (
                      <Image source={cartProduct.image} style={styles.cartVisualImage} resizeMode="contain" />
                    ) : (
                      <View style={[styles.cartVisualPlate, { backgroundColor: cartProduct.color || "#E3E3E3" }]}> 
                        <Text style={styles.cartVisualText}>{cartName.split(" ")[0]}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cartCopy}>
                    <Text style={styles.cartName} numberOfLines={2}>{cartName}</Text>
                    <Text style={styles.cartPackText}>{cartQty}</Text>
                    <Text style={styles.cartMoveWishlist}>Move to wishlist</Text>
                  </View>
                  <Text style={styles.cartRowPrice}>{money(rowPrice)}</Text>
                  <QuantityStepper value={item.quantity} onChange={(nextQuantity) => changeCartQuantity(cartId, nextQuantity)} />
                </View>
              );
            })}
            <View style={styles.cartBottomDivider} />
            <Pressable style={styles.addMoreButton}>
              <MaterialCommunityIcons name="plus" size={29} color="#078C17" />
              <Text style={styles.addMoreText}>Add More Items</Text>
            </Pressable>
          </View>

          <ProductRail
            title="Last minute buys"
            subtitle="Popular add-ons delivered with this order"
            items={SIMILAR_PRODUCTS}
            quantities={railQuantities}
            onChangeQuantity={changeRailQuantity}
          />

          <View style={styles.savingsCorner}>
            <Pressable style={styles.couponRow} onPress={onOpenCoupons}>
              <View style={styles.couponIcon}>
                <MaterialCommunityIcons name="tag" size={20} color={BLUE} />
              </View>
              <View style={styles.couponCopy}>
                <Text style={styles.couponTitle}>{appliedCoupon ? `${appliedCoupon.code} applied` : "Apply a coupon"}</Text>
                <Text style={[styles.couponSub, appliedCoupon && { color: "#138A36", fontWeight: "800" }]}>{appliedCoupon ? `You saved ${money(couponDiscount)}` : "Save more with available offers"}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#8A9099" />
            </Pressable>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipHeaderRow}>
              <View style={styles.tipIconWrap}>
                <MaterialCommunityIcons name="hand-heart-outline" size={23} color="#D66B24" />
              </View>
              <View style={styles.tipHeaderCopy}>
                <Text style={styles.tipTitle}>Tip your delivery partner</Text>
                <Text style={styles.tipSubtitle}>100% of your tip goes to your delivery partner</Text>
              </View>
            </View>
            <View style={styles.tipOptions}>
              {[0, 10, 20, 30].map((amount) => {
                const selected = tip === amount;
                return (
                  <Pressable
                    key={amount}
                    onPress={() => setTip(amount)}
                    style={[styles.tipOption, selected && styles.tipOptionSelected]}
                  >
                    <Text style={[styles.tipOptionText, selected && styles.tipOptionTextSelected]}>
                      {amount === 0 ? "No tip" : money(amount)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.billCard}>
            <Text style={styles.billTitle}>Bill details</Text>
            <BillLine label="Item Total" oldValue={money(mrpTotal)} value={money(itemTotal)} />
            <BillLine label="Handling Fee" oldValue="₹12.22" value={money(handling)} />
            <BillLine label="Small Cart Fee" value={smallCartFee ? money(smallCartFee) : "FREE"} helper="No small cart fee on orders above ₹99" />
            {couponDiscount > 0 ? <BillLine label={`Coupon (${appliedCoupon.code})`} value={`-${money(couponDiscount)}`} /> : null}
            <View style={styles.billSeparator} />
            <BillLine label="Delivery Partner Tip" value={money(tip)} />
            <View style={styles.billSeparator} />
            <BillLine label="To Pay" oldValue={money(mrpTotal + 52)} value={money(toPay)} bold />
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteText}><Text style={styles.noteLabel}>NOTE:</Text> Orders cannot be cancelled and are non-refundable once packed for delivery.</Text>
            <Text style={styles.policyText}>Read cancellation policy</Text>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>

        <View style={styles.stickyPayment}>
          <View style={styles.paymentTopRow}>
            <View style={styles.paymentLogo}>
              <Text style={styles.paymentLogoText}>{stickyMethod.includes("Paytm") ? "paytm" : "C"}</Text>
            </View>
            <View style={styles.paymentCopy}>
              <Text style={styles.payUsing}>Pay using</Text>
              <Text style={styles.paymentMethod}>{stickyMethod}</Text>
            </View>
            <Pressable style={styles.changePayment} onPress={onChangePayment}>
              <Text style={styles.changePaymentText}>Change</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color={BLUE} />
            </Pressable>
          </View>
          <Pressable style={styles.checkoutPayButton} onPress={onChangePayment}>
            <View>
              <Text style={styles.checkoutPayAmount}>{money(toPay)}</Text>
              <Text style={styles.checkoutPayCaption}>TOTAL</Text>
            </View>
            <View style={styles.checkoutPayCta}>
              <Text style={styles.checkoutPayText}>Proceed to pay</Text>
              <MaterialCommunityIcons name="arrow-right" size={21} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create(withReadableGroceryTypography({
  checkoutTitle: {
    color: "#171A20",
    fontSize: 20,
    lineHeight: 25,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  checkoutSubtitle: {
    marginTop: 1,
    color: "#171717ff",
    fontSize: 19,
    lineHeight: 23,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
  },
  checkoutAddressRow: {
    marginTop: 1,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  checkoutAddress: {
    color: "#101217",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Manrope_400Regular",
    fontWeight: "400",
  },
  secureHeaderPill: {
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 17,
    backgroundColor: "#EAF8F2",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  secureHeaderText: {
    color: "#087B59",
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Manrope_600SemiBold",
    fontWeight: "600",
  },
  deliveryCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E7E9EE",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  deliveryIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryCopy: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },
  deliveryLabel: {
    color: "#7B818B",
    fontSize: 10,
    lineHeight: 13,
    fontFamily: "Manrope_500Medium",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  deliveryName: {
    marginTop: 2,
    color: "#20242A",
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Manrope_600SemiBold",
    fontWeight: "600",
  },
  deliveryAddress: {
    marginTop: 3,
    color: "#747A84",
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "Manrope_400Regular",
    fontWeight: "400",
  },
  deliveryChange: {
    color: BLUE,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Manrope_600SemiBold",
    fontWeight: "600",
  },
  cartSectionTitle: {
    color: "#080A0D",
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
  },
  cartSectionEta: {
    color: "#078C17",
  },
  cartSectionSubtitle: {
    marginTop: 2,
    color: "#7B818B",
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Manrope_400Regular",
    fontWeight: "400",
  },
  billTitle: {
    marginBottom: 2,
    color: "#20242A",
    fontSize: 16,
    lineHeight: 21,
    fontFamily: "Manrope_600SemiBold",
    fontWeight: "600",
  },
  checkoutPayButton: {
    height: 60,
    marginTop: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkoutPayAmount: {
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 21,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
  },
  checkoutPayCaption: {
    marginTop: 1,
    color: "rgba(255,255,255,0.72)",
    fontSize: 9,
    lineHeight: 11,
    fontFamily: "Manrope_600SemiBold",
    fontWeight: "600",
    letterSpacing: 0.7,
  },
  checkoutPayCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  checkoutPayText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Manrope_600SemiBold",
    fontWeight: "600",
  },
  tipCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: "#ffffffff",
    backgroundColor: "#ffffffff",
  },
  tipHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tipIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "#FFF1E7",
    alignItems: "center",
    justifyContent: "center",
  },
  tipHeaderCopy: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    color: "#292D33",
    fontSize: 14,
    lineHeight: 19,
    fontFamily: "Manrope_600SemiBold",
    fontWeight: "600",
  },
  tipSubtitle: {
    marginTop: 2,
    color: "#858A93",
    fontSize: 10,
    lineHeight: 14,
    fontFamily: "Manrope_400Regular",
    fontWeight: "400",
  },
  tipOptions: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
  },
  tipOption: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E3E8",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  tipOptionSelected: {
    borderColor: "#D66B24",
    backgroundColor: "#FFF1E7",
  },
  tipOptionText: {
    color: "#666C75",
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Manrope_500Medium",
    fontWeight: "500",
  },
  tipOptionTextSelected: {
    color: "#B95418",
    fontFamily: "Manrope_600SemiBold",
    fontWeight: "600",
  },
  addMoreButton: {
    alignSelf: "stretch",
    height: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addMoreText: {
    color: "#078C17",
    fontSize: 11,
    lineHeight: 21,
    fontFamily: "Manrope_600SemiBold",
    fontWeight: "600",
  },
  billCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: "#E7E9EE",
    backgroundColor: "#FFFFFF",
  },
  billHelper: {
    ...GROCERY_TYPOGRAPHY.caption,
    marginTop: 3,
    color: "#8A7070",
  },
  billLabel: {
    ...GROCERY_TYPOGRAPHY.body,
    color: "#4C4F57",
  },
  billLabelBold: {
    color: "#191C22",
    fontWeight: "900",
  },
  billLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  billLineWrap: {
    marginTop: 12,
  },
  billOldValue: {
    color: "#777D86",
    fontSize: 12,
    lineHeight: 15,
    textDecorationLine: "line-through",
  },
  billSeparator: {
    marginTop: 10,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D9DDE3",
  },
  billValue: {
    ...GROCERY_TYPOGRAPHY.bodyStrong,
    color: "#2C3037",
  },
  billValueBold: {
    ...GROCERY_TYPOGRAPHY.priceLarge,
    color: "#171A20",
  },
  billValues: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bottomSpace: {
    height: 156,
  },
  cardEyebrow: {
    ...GROCERY_TYPOGRAPHY.sectionEyebrow,
    color: "#7E838C",
  },
  cartCard: {
    marginHorizontal: 12,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 0,
    borderRadius: 12,
    borderWidth: 0,
    borderColor: "#ffffffff",
    backgroundColor: "#FFFFFF",
  },
  cartCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cartCopy: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 6,
  },
  cartItemRow: {
    minHeight: 84,
    marginTop: 19,
    flexDirection: "row",
    alignItems: "center",
  },
  cartName: {
    fontSize: 12,
    lineHeight: 14,marginLeft: 18,left:-20,
    fontFamily: "PlusJakartaSans_500Medium",
    fontWeight: "600",
    color: "#111318",
  },
  cartPackText: {
    marginTop: 5,
    color: "#92888A",
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  cartMoveWishlist: {
    marginTop: 9,
    marginLeft: 0,
    color: "#948D90",
    fontSize: 10,
    lineHeight: 16,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  cartRowPrice: {
    width: 48,
    marginRight: 85,marginTop: -29,
    color: "#090B0F",backgroundColor: "#fff1aaff",
    fontSize: 17,
    lineHeight: 22,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  cartBottomDivider: {
    borderTopWidth: 1,
    borderColor: "#E3E4E6",
  },
  cartMetaDivider: {
    width: 1,
    height: 11,
    backgroundColor: "#D7DCE4",
  },
  cartMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cartMetaText: {
    color: GREEN,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "900",
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  cartMetaSub: {
    color: "#6F7680",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  cartPriceRow: {
    marginTop: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
    borderRadius: 0,
    backgroundColor: "#fff1aaff",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },
  cartInlinePrice: {
    color: "#05070A",
    fontSize: 17,
    lineHeight: 21,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontWeight: "500",
    letterSpacing: -0.75,
  },
  cartInlineMrp: {
    color: "#8B9098",
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    textDecorationLine: "line-through",
  },
  cartInlineOffer: {
    marginTop: 1,
    color: GREEN,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  cartVisual: {
    width: 50,
    height: 50,
    borderRadius: 8,marginLeft: -6,marginTop: -40,
    borderWidth: 0,
    backgroundColor: "#f4f4f4ff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  cartImageFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 30,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 7,
  },
  cartFooterQty: {
    flex: 1,
    bottom: -7,
    paddingLeft: 14,
    color: "#05070A",
    fontSize: 10,
    lineHeight: 20,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontWeight: "700",
    letterSpacing: -0.35,
    textAlign: "center",
  },
  cartVegMark: {
    position: "absolute",
    left: 7,
    bottom: 7,
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: "#129B53",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  cartVisualImage: {
    width: "78%",
    height: "78%",
    marginBottom: 0,
    zIndex: 1,
  },

  cartVisualText: {
    color: "#31343A",
    fontSize: 11,
    fontWeight: "900",
  },
  changePayment: {
    flexDirection: "row",
    alignItems: "center",
  },
  changePaymentText: {
    color: BLUE,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  content: {
    paddingTop: 26,
    paddingBottom: 0,
  },
  couponCopy: {
    flex: 1,
    marginLeft: 14,
  },
  couponIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  couponRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  couponSub: {
    marginTop: 5,
    color: "#888E97",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "500",
  },
  couponTitle: {
    color: "#3A3E45",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },
  dashedDivider: {
    marginTop: 12,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D7DCE4",
  },
  emptyBack: {
    position: "absolute",
    top: 48,
    left: 24,
    zIndex: 2,
  },
  emptyBowl: {
    width: 190,
    height: 86,
    borderRadius: 22,
    backgroundColor: "#41A2F7",
    shadowColor: "#1D7EDB",
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  emptyBowlBack: {
    position: "absolute",
    top: -48,
    width: 164,
    height: 82,
    transform: [{ rotate: "-4deg" }],
  },
  emptyBowlMid: {
    position: "absolute",
    top: -26,
    width: 180,
    height: 82,
  },
  emptyBowls: {
    height: 160,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptySafe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  emptySubtitle: {
    ...GROCERY_TYPOGRAPHY.bodyStrong,
    marginTop: 12,
    color: "#6E737C",
  },
  emptyTitle: {
    ...GROCERY_TYPOGRAPHY.display,
    marginTop: 54,
    color: "#151921",
    textAlign: "center",
  },
  etaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  etaText: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "800",
    letterSpacing: -0.18,
    color: "#343941",
  },
  header: {
    minHeight: 84,
    paddingHorizontal: 0,
    paddingTop: 6,
    paddingBottom: 0,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: "hidden",
  },
  headerTopRow: {
    minHeight: 56,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerActionButton: {
    width: 34,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  headerActionDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#DDE1E7",
  },
  headerIconPill: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F4F5F7",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSharedPill: {
    height: 42,
    minWidth: 72,
    borderRadius: 21,
    paddingHorizontal: 11,
    backgroundColor: "#F4F5F7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerSavingsPill: {
    height: 34,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  headerSavingsText: {
    color: "#ffffffff",
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Manrope_600SemiBold",
    fontWeight: "600",
    letterSpacing: -0.15,
  },
  headerAddress: {
    marginTop: -1,
    color: "#75687D",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "500",
    letterSpacing: -0.35,
  },
  headerBack: {
    width: 38,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCartPill: {
    width: 52,
    height: 36,
    borderRadius: 22,
    backgroundColor: "#F1F2F4",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  headerCopy: {
    flex: 1,
    marginLeft: 9,
    marginRight: 10,
  },
  headerTitle: {
    color: "#202329",
    fontSize: 22,
    lineHeight: 26,
    fontFamily: "Manrope_800ExtraBold",
    fontWeight: "900",
    letterSpacing: -0.45,
  },
  headerEta: {
    color: "#151921",
    fontSize: 21,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: -1,
  },
  headerEtaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  itemCount: {
    color: "#17191E",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "500",
  },
  itemMrp: {
    color: "#777D86",
    fontSize: 12,
    lineHeight: 15,
    textDecorationLine: "line-through",
    textAlign: "right",
    fontFamily: "PlusJakartaSans_500Medium",
  },
  itemPrice: {
    color: "#2E3239",
    textAlign: "right",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  itemPriceBlock: {
    width: 38,
    marginLeft: 6,
  },
  noteCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E7E9EE",
    backgroundColor: "#FFFFFF",
  },
  noteLabel: {
    color: "#E53958",
  },
  noteText: {
    ...GROCERY_TYPOGRAPHY.body,
    color: "#5D626B",
  },
  payUsing: {
    ...GROCERY_TYPOGRAPHY.caption,
    color: "#777D86",
  },
  paymentCopy: {
    flex: 1,
    marginLeft: 10,
  },
  paymentLogo: {
    width: 32,
    height: 32,
    borderRadius: 7,
    backgroundColor: "#080A0F",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentLogoText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  paymentMethod: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    letterSpacing: -0.18,
    marginTop: 2,
    color: "#2E333A",
  },
  paymentTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  policyText: {
    marginTop: 12,
    color: BLUE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  railAddButton: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 6,
    shadowColor: "#8C98A4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0,
    shadowRadius: 5,
    elevation: 0,
  },
  railAddButtonText: {
    color: GREEN,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  railAddStepper: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 76,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.8,
    borderColor: BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  railAddStepperButton: {
    width: 20,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  railAddStepperText: {
    color: BLUE,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "700",
  },
  railAddStepperValue: {
    color: BLUE,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
  },
  railBottomRow: {
    marginTop: 2,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 6,
  },
  railCard: {
    width: 136,
    minHeight: 328,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E6E8EB",
    paddingBottom: 0,
    overflow: "hidden",
    shadowColor: "#596273",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 0,
  },
  railInfo: {
    minHeight: 176,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 12,
  },
  railContent: {
    paddingRight: 12,
    paddingBottom: 14,
    gap: 7,
  },
  railDiscountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    minWidth: 42,
    minHeight: 42,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "#5B1797",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  railDiscountText: {
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  railEta: {
    color: "#6F7680",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },
  railImageMetaRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  railHeartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9,
  },
  railFooterQty: {
    flex: 1,
    bottom: -8,
    paddingLeft: 16,
    paddingRight: 44,
    color: "#05070A",
    fontSize: 12,
    lineHeight: 23,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontWeight: "700",
    letterSpacing: -0.6,
    textAlign: "center",
  },
  checkoutCardDots: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    zIndex: 8,
  },
  checkoutCardDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#AEB4BC",
  },
  checkoutCardDotActive: {
    backgroundColor: BLUE,
  },
  railImageFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 7,
  },
  railMetaDivider: {
    width: 1,
    height: 11,
    backgroundColor: "#D7DCE4",
  },
  railMetaRow: {
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  railRatingGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  railMrp: {
    color: "#A2A6AC",
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    textDecorationLine: "line-through",
  },
  railName: {
    marginTop: 7,
    minHeight: 32,
    paddingHorizontal: 0,
    color: "#15171A",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "500",
  },
  railOffer: {
    marginTop: 5,
    paddingHorizontal: 0,
    color: GREEN,
    fontSize: 13,
    lineHeight: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  railPrice: {
    color: "#20242A",
    fontSize: 17,
    lineHeight: 21,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontWeight: "900",
    letterSpacing: -0.75,
  },
  railPriceStack: {
    marginTop: 8,
    paddingHorizontal: 0,
    alignSelf: "stretch",
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
    minWidth: 0,
  },
  railBottomSpacer: {
    flex: 1,
  },
  railQty: {
    alignSelf: "flex-start",
    minHeight: 22,
    marginTop: 4,
    borderRadius: 4,
    borderWidth: 0.6,
    borderColor: "#C9DFFB",
    paddingHorizontal: 5,
    color: "#0759F6",
    fontSize: 11,
    lineHeight: 20,
    fontWeight: "900",
  },
  railQtySubline: {
    alignSelf: "flex-start",
    minHeight: 22,
    marginTop: 4,
    borderRadius: 6,
    borderWidth: 0.6,
    borderColor: "#C9DFFB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    color: "#0759F6",
    fontSize: 11,
    lineHeight: 20,
    fontWeight: "900",
  },
  railRatingRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  railRatingText: {
    color: GREEN,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "900",
  },
  railReviewText: {
    color: "#7A818A",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
  railSection: {
    marginHorizontal: 12,
    marginTop: 8,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  railTitleRow: {
    marginBottom: 8,
  },
  railVisual: {
    height: 150,
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 0,
    borderColor: "transparent",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    marginBottom: 0,
  },
  railTimeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  railVegDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#129B53",
  },
  railVegMark: {
    position: "absolute",
    left: 8,
    bottom: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 0,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  railVisualPlate: {
    width: "78%",
    height: "62%",
    marginBottom: 0,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  railVisualText: {
    color: "rgba(41,45,52,0.78)",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  railProductImage: {
    width: "88%",
    height: "78%",
    marginBottom: 0,
  },
  railQtySelector: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 32,
    borderBottomWidth: 2,
    borderBottomColor: BLUE,
    backgroundColor: "#EAF3FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  railQtySelectorText: {
    color: BLUE,
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  railInfoDivider: {
    marginTop: 9,
    marginHorizontal: 0,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#E0E3E7",
  },
  railUnitRate: {
    marginTop: 4,
    paddingHorizontal: 7,
    color: "#8B9098",
    fontSize: 10,
    lineHeight: 14,
    fontFamily: "PlusJakartaSans_400Regular",
    fontWeight: "400",
  },
  railQtyText: {
    marginTop: 4,
    color: "#656B73",
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "PlusJakartaSans_500Medium",
    fontWeight: "500",
  },
  railStock: {
    marginTop: 1,
    color: "#B56927",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  safe: {
    flex: 1,
    backgroundColor: "#ffffffff",
  },
  savingsBold: {
    fontWeight: "900",
  },
  savingsCorner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 0,
    borderColor: "#E7E9EE",
    backgroundColor: "#FFFFFF",
  },
  savingsPill: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#C9F7DF",
    justifyContent: "center",
  },
  savingsText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    letterSpacing: -0.05,
    color: "#0A9A72",
  },
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  sectionSubtitle: {
    ...GROCERY_TYPOGRAPHY.body,
    marginTop: 3,
    color: "#6A6F78",
  },
  sectionTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "#30343A",
  },
  slideKnob: {
    position: "absolute",
    left: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  slidePayButton: {
    height: 48,
    marginTop: 9,
    borderRadius: 24,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  slidePayText: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "800",
    letterSpacing: -0.18,
    color: "#FFFFFF",
  },
  startShoppingButton: {
    marginTop: 34,
    paddingHorizontal: 28,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#EEF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  startShoppingText: {
    color: BLUE,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
  },
  stepper: {
    position: "absolute",
    right: 0,
    top: 15,
    width: 65,
    height: 30,
    borderRadius: 7,
    backgroundColor: BLUE,
    borderWidth: 0,
    borderColor: BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#8C98A4",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 4 },
    elevation: 0,
    zIndex: 10,
  },
  stepperButton: {
    width: 25,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
  },
  stepperValue: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "700",
  },
  statusBarCover: {
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
  stickyPayment: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -5 },
    elevation: 0,
  },
  superfastPill: {
    height: 25,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: "#E8FFF4",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  superfastText: {
    color: GREEN,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  tomato: {
    position: "absolute",
    left: 46,
    bottom: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F94A48",
  },
  wishlistText: {
    marginTop: 10,
    color: "#7C828C",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "500",
    textDecorationLine: "underline",
    textDecorationStyle: "dotted",
  },
}));
