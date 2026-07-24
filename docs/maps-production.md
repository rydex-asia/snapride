# Production maps and routing

## Key separation

- `GOOGLE_ROUTES_API_KEY` exists only in the backend secret store. Enable only the Routes API and restrict it to the backend's fixed egress IPs where available.
- `GOOGLE_MAPS_ANDROID_SDK_KEY` is injected by EAS into the native Android build. Restrict it to **Maps SDK for Android**, package `com.kiran_kotholla.ridernative`, and every release/debug SHA-1 certificate used by EAS.
- `GOOGLE_MAPS_IOS_SDK_KEY` is injected by EAS into the native iOS build. Restrict it to **Maps SDK for iOS** and bundle ID `com.kiran-kotholla.ridernative`.
- Never prefix these keys with `EXPO_PUBLIC_`. Native SDK keys are present in the binary by design and must be protected with application restrictions; the Routes key must never enter the binary.

Create EAS secrets/environments for the two native keys, for example:

```sh
eas env:create --environment production --name GOOGLE_MAPS_ANDROID_SDK_KEY --value '<key>' --visibility sensitive
eas env:create --environment production --name GOOGLE_MAPS_IOS_SDK_KEY --value '<key>' --visibility sensitive
```

Store `GOOGLE_ROUTES_API_KEY` in the backend deployment secret manager, not EAS.

## Runtime operation

- The app calls `POST /api/v1/routing/route`; only the backend calls Google Routes v2.
- Responses are traffic-aware, retried for transient failures, rate-limited, and cached in Redis.
- Monitor backend logs for the 80% and 100% daily quota warnings. Add alerts for HTTP 429 rate, Google latency, cache hit rate, and route error rate.
- The public OSRM demo service is not used.
