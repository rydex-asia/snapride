# Physical-device maps and tracking test plan

Run on at least one supported Android device and one supported iPhone using production-like EAS builds.

| Scenario | Procedure | Pass criteria |
|---|---|---|
| Weak network | Throttle to high latency/packet loss while selecting and riding | Existing route remains visible; retry state is clear; no fake route; recovery needs no restart |
| Network loss | Disable data for 30 seconds during live trip | Reconnecting state appears, last point becomes stale, socket rejoins the order room on recovery |
| GPS loss | Disable location or move indoors | Stale state appears within 15 seconds; inaccurate samples are rejected; manual support remains available |
| Socket restart | Restart the realtime service during a trip | Exponential reconnect succeeds and the client rejoins user/order rooms without duplicate listeners |
| Off-route | Drive/walk more than 80 m off the route | A new traffic-aware route and ETA are requested; movement snaps only when within 70 m |
| Google outage/quota | Return backend 503/429 | Route-unavailable card and Retry appear; app stays usable and no OSRM call occurs |
| Map SDK failure | Use an intentionally invalid restricted key in a test build | Map-unavailable state appears after timeout; app does not crash |
| Permission denial | Deny foreground location, then permanently deny | Clear recovery/manual address flow; no repeated OS prompt loop |
| Background/restore | Background and foreground during active trip | Customer app does not collect customer location in background; captain stream reconnects cleanly |
| Payment network loss | Disable data after provider checkout opens and restore it after 30 seconds | Checkout does not create a duplicate order; pending state remains recoverable and verification resumes after connectivity returns |
| Payment callback loss | Complete payment, then kill the app before the provider callback is handled | Relaunch reconciles the order from the backend/provider status and shows the correct paid or pending state |
| Payment failure | Force a declined or failed provider payment | Failure reason and Retry are shown; cart/order context is retained and retry creates a fresh payment attempt |
| Duplicate payment action | Rapidly tap Pay/Retry and repeat the provider return flow | Only one active payment/order is accepted; idempotency prevents duplicate charges and duplicate orders |
| Webhook delay | Delay the payment webhook while the provider reports success | App shows a bounded verifying state, polls safely, and resolves after the signed webhook/provider verification arrives |

Run every scenario once on Wi-Fi and once on mobile data where applicable.
Record device/OS/build, timestamps, screenshots, socket logs, GPS accuracy,
route latency, reroute latency, payment/order IDs, recovery duration, and result.
Never record card, UPI, token, address, or raw coordinate data.

Physical-device execution is a release gate. Do not mark a scenario passed from
an emulator, simulator, unit test, or code inspection alone.
