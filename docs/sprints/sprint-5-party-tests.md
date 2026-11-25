# Sprint 5 · #439 · Test parties with multiple users

The test ran against the `salah` branch after commit `d7086d7`. Leena and Robin signed in through two independently mounted MovieVerse pages in happy-dom. Both opened the Friday Film Club link for *Arrival*. The clients shared an in-memory API for sign-in and public movie reviews. This run covered frontend behavior; a live PostgreSQL deployment and separate browser devices were outside its scope.

| Scenario | Expected | Observed |
| --- | --- | --- |
| Both accounts post a review | After refreshing, both users see both texts with the correct authors. | Passed in both directions. |
| Leena invites Robin | Robin can open or accept the invitation in Robin’s own session. | Leena saw a pending invitation. Robin received no invitation control. |
| Both accounts join the club | Both rosters include Leena, Robin and the two demo guests. | Each roster listed its own player and both guests, showing three of six places occupied. |

Invitation delivery and roster synchronization are recorded as expected failures. The current demo stores invitations and room membership in each client’s React state. When shared membership is implemented, connect the fixture to that behavior and convert the two `it.fails` cases to ordinary tests.

Run the three scenarios from `Frontend`.

```powershell
npx.cmd vitest run multiUserParty
```
