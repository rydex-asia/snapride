# Location permissions and retention

The customer app requests foreground approximate/precise location only. It does not request background location. A separate partner build must add background permission only after a dedicated consent screen, store-review justification, and a persistent Android foreground-service notification.

- Explain collection before the OS prompt and provide a manual-address path after denial.
- Collect timestamp, accuracy, heading, and speed only during an active trip.
- Reject samples older than 60 seconds, more than 10 seconds in the future, or less accurate than 200 metres.
- Mark tracking stale after 15 seconds and show reconnecting state; do not imply that stale coordinates are live.
- Retain raw active-trip samples for no more than 24 hours unless local law or an active safety case requires longer retention. Delete or irreversibly aggregate afterward.
- Restrict raw location access to dispatch/safety roles, audit every access, encrypt in transit/at rest, and support customer deletion/export requests.
- Publish purpose, retention, processors, and emergency-disclosure rules in the privacy notice.
