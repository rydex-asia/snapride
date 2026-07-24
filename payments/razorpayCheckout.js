function resolveRazorpayModule() {
  try {
    const loaded = require("react-native-razorpay");
    return loaded?.default || loaded;
  } catch (error) {
    throw new Error("Razorpay checkout needs a development build with react-native-razorpay installed.");
  }
}

export async function openRazorpayCheckout(order, customer = {}) {
  if (!order?.keyId || !order?.orderId || !order?.amountPaise) {
    throw new Error("Payment order is incomplete");
  }

  const RazorpayCheckout = resolveRazorpayModule();
  if (!RazorpayCheckout?.open) {
    throw new Error("Razorpay checkout is not available in this build");
  }

  try {
    return await RazorpayCheckout.open({
      key: order.keyId,
      amount: order.amountPaise,
      currency: order.currency || "INR",
      name: order.name || "Rydex",
      description: order.description || "Rydex payment",
      order_id: order.orderId,
      prefill: {
        name: customer.name || "",
        email: customer.email || "",
        contact: customer.phone || "",
      },
      theme: {
        color: "#1754D1",
      },
    });
  } catch (error) {
    throw new Error(error?.description || error?.message || "Payment was cancelled");
  }
}
