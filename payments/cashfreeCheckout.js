function resolveCashfreeModules() {
  try {
    return {
      sdk: require('react-native-cashfree-pg-sdk'),
      contract: require('cashfree-pg-api-contract'),
    };
  } catch (error) {
    throw new Error('Cashfree checkout needs a development build with the Cashfree SDK installed.');
  }
}

export function openCashfreeCheckout(order) {
  if (!order?.paymentSessionId || !order?.orderId) throw new Error('Cashfree payment session is incomplete');
  const { sdk, contract } = resolveCashfreeModules();
  const gateway = sdk?.CFPaymentGatewayService;
  const environment = String(order.environment || 'SANDBOX').toUpperCase() === 'PRODUCTION'
    ? contract.CFEnvironment.PRODUCTION
    : contract.CFEnvironment.SANDBOX;
  if (!gateway?.doWebPayment || !contract?.CFSession) throw new Error('Cashfree checkout is not available in this build');

  return new Promise((resolve, reject) => {
    gateway.setCallback({
      onVerify: (orderId) => { gateway.removeCallback(); resolve({ orderId, status: 'VERIFY' }); },
      onError: (error, orderId) => {
        gateway.removeCallback();
        reject(new Error(error?.status || error?.message || `Cashfree payment failed for ${orderId}`));
      },
    });
    try {
      gateway.doWebPayment(new contract.CFSession(order.paymentSessionId, order.orderId, environment));
    } catch (error) {
      gateway.removeCallback();
      reject(error);
    }
  });
}
