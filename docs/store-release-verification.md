# Store release verification

Audit date: 24 July 2026

This audit covers repository and resolved Expo configuration only. Play Console,
App Store Connect, Apple Developer certificates/profiles, and EAS remote
credentials were not accessible and remain unverified.

## Release gate

**Status: BLOCKED**

Do not submit the current native projects to either store.

## Package identifiers

| Platform | Current value | Status |
|---|---|---|
| Android | `com.kiran_kotholla.ridernative` | Provisional; valid locally but not verified as registered/available in Play Console |
| iOS | `com.kiran-kotholla.ridernative` | Provisional; not verified as an Apple App ID or App Store Connect bundle ID |
| Expo/EAS project | `0fcfce7e-1628-4198-b3f7-e064c014aa98` | Present in resolved Expo config |

The Android and iOS identifiers use different separators. Select final,
brand-owned identifiers before creating either store record. Never change an
identifier after the first production release.

## Signing and credentials

| Check | Result |
|---|---|
| Android local release signing | **Fail:** `android/app/build.gradle` signs `release` with `signingConfigs.debug` |
| Android Play App Signing | Not verifiable without Play Console access |
| Android upload key / EAS credential | Not verifiable without EAS credential access |
| iOS development team | **Missing:** no `DEVELOPMENT_TEAM` is configured in the Xcode project |
| iOS distribution certificate/profile | Not verifiable without Apple Developer/EAS access |
| iOS push entitlement | **Not production-ready:** `aps-environment` is `development` |
| Google Maps production keys | **Missing in resolved config:** Android and iOS both report unconfigured |

Use Play App Signing with a separate upload key. Use an Apple Distribution
certificate and App Store provisioning profile for the final iOS bundle ID.
Do not commit keystores, certificates, private keys, or service-account JSON.

## Version and build metadata

| Field | Android | iOS | Expo |
|---|---|---|---|
| Marketing version | `1.0.0` | `1.0` / plist `1.0.0` | `1.0.0` |
| Build number | `1` | `1` | Production profile uses `autoIncrement` |

The first-release versions are usable, but the final AAB and IPA must be
inspected after EAS build to confirm the submitted artifacts contain the
expected values and target SDK. As of 31 August 2026, new Google Play apps and
updates must target Android 16 / API 36.

## Privacy and permissions

| Check | Result |
|---|---|
| In-app Privacy Policy | **Fail:** screen contains only a title |
| In-app Terms of Service | **Fail:** screen contains only a title |
| Public privacy policy URL | **Missing** |
| Account deletion in app and public URL | **Missing/not verified** |
| Google Play Data safety form | Not verifiable; must include app and third-party SDK behavior |
| App Store privacy answers | Not verifiable; must include app and third-party SDK behavior |
| iOS privacy manifest | **Incomplete:** required-reason APIs exist, but collected data is declared empty |
| Foreground location explanation | Present |
| iOS always-location strings | **Conflict:** native plist contains Always usage strings although customer policy says foreground only |
| Android storage permissions | **Review/remove:** legacy read/write external-storage permissions are present |
| Android overlay permission | **Review/remove:** `SYSTEM_ALERT_WINDOW` is present in the main manifest |
| Android backup | **Review:** `allowBackup=true` needs an explicit data extraction/backup policy |

At minimum, declarations must account for account/contact data, precise or
approximate location, trip and transaction history, support content, device
identifiers/diagnostics, crash/performance data, notifications, and every
payment/provider SDK data flow actually used in production.

## Store listing and review metadata

No repository-managed App Store or Play Store metadata set was found. The
following remain required:

- Final app name, short description/subtitle, full description, keywords and category
- App icon, feature graphic, phone screenshots and supported-device screenshots
- Privacy policy URL, support URL, marketing URL and account-deletion URL
- Age rating / target audience questionnaires
- Data safety and App Privacy answers
- Content-rights and encryption/export-compliance declarations
- Review contact, review notes and a working demo account where login is required
- Release notes, countries/regions, pricing and phased-release choice
- Developer identity/contact verification and organization details where applicable

## Required verification sequence

1. Approve final Android and iOS identifiers.
2. Register the Play app and Apple App ID/App Store Connect record.
3. Configure EAS Android upload credentials and enroll in Play App Signing.
4. Configure Apple Distribution, App Store provisioning and production APNs.
5. Add restricted production Maps SDK keys and production API/socket variables.
6. Remove unjustified permissions and complete the privacy policy, retention,
   deletion and store privacy declarations.
7. Prepare final listing metadata and screenshots.
8. Build production AAB/IPA, inspect identifiers/version/permissions/signatures,
   upload to closed Test/Play testing and TestFlight, then run the physical-device
   resilience test plan.

