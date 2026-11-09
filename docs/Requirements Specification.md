# MovieBus – Requirements Specification

**Version:** 0.2

**Status:** Draft update — pending customer/supervisor approval

**Updated:** 9 November 2026


## 1. Project Overview

MovieBus is a web application for movie enthusiasts, with a focus on community features. Its purpose is to make it easier to discover movies, browse movie information, share reviews, and discuss movies with groups of friends.

According to the customer's initial requests:

- Visitors can browse movies, basic movie information, and public reviews without logging in.
- Users can search for movies and filter search results.
- Logged-in users can review movies.
- Users can create groups and participate in group discussions.
- The application must also be usable on mobile devices.
- The expected user base is approximately 2,000 users. This does not mean 2,000 concurrent users.


### 1.1 User Roles (Preliminary Interpretation)

- **Visitor:** Can browse movies, basic movie information, and public reviews.
- **Logged-in user:** Can post reviews and use community features as they become available.
- **Group member:** Can participate in the activities of their group.
- **Group administrator:** Can manage group memberships and content according to permissions to be agreed upon with the customer.

The exact permissions for each role will be clarified later.


## 2. Functional Requirements (FR)

The following requirements were included in the original preliminary requirements list. Their priorities and any further details must be confirmed with the customer.

| ID | Requirement |
| --- | --- |
| FR-01 | Users can browse movies and view their basic information without logging in. |
| FR-02 | Users can search for movies using a search feature. |
| FR-03 | Users can filter movie search results based on different criteria. |
| FR-04 | The system displays information about which movie theaters are showing a movie. |
| FR-05 | Logged-in users can rate movies on a scale of 1–5 stars. |
| FR-06 | Logged-in users can write text reviews of movies. |
| FR-07 | Registered users can create movie groups. |
| FR-08 | Group members can communicate with each other in a group discussion. |


### 2.1 Additional Features Requested by the Customer

The following features were mentioned during the customer's initial presentation and are now expanded into draft requirements and user stories below. Their inclusion does not mean they have been approved or prioritized:

- Featured or interesting movies and a search feature on the home page.
- Advanced search filters and potentially personalized movie recommendations.
- Movie screening information and key movie details.
- Public and private reviews, as well as review history.
- Group discovery, approval or rejection of join requests, member removal, and the ability to leave a group.
- Assigning or transferring group administrator permissions and moderating inappropriate content.
- Personal movie lists and group-specific lists, including sharing lists with people who are not logged in.
- Adding friends and viewing which groups they belong to.
- Group discussion functionality; whether real-time messaging is required remains to be clarified.
- Possible statistics about watched movies and other activity.
- A primarily Finnish-language interface, with possible support for English and Swedish.


### 2.2 Detailed Requirements and Proposed Extensions

FR-01–FR-08 remain the original requirement groups. Decimal IDs split them into smaller behaviours. FR-09–FR-15 are proposed extensions from the customer notes and existing backlog. All new wording and acceptance criteria require review; conditional features are not release commitments.

| ID | Draft requirement |
| --- | --- |
| FR-01.1 | A visitor can browse movies without registering. |
| FR-01.2 | A visitor can view a selected movie's details. |
| FR-01.3 | A visitor can discover movies from the homepage. |
| FR-02.1 | A visitor can search movies by title. |
| FR-02.2 | A visitor can browse more search results. |
| FR-03.1 | A visitor can filter search results. |
| FR-04.1 | A visitor can see where a movie is showing. |
| FR-05.1 | A logged-in user can rate a movie. |
| FR-05.2 | A visitor can see an average movie rating. |
| FR-06.1 | A logged-in user can write a text review. |
| FR-06.2 | A visitor can read public reviews. |
| FR-06.3 | A logged-in user can view my previous reviews. |
| FR-06.4 | A review author can edit or delete my reviews. |
| FR-06.5 | A review author can choose who can read my review. |
| FR-07.1 | A logged-in user can create a movie group. |
| FR-07.2 | A user can find groups and view their details. |
| FR-07.3 | A logged-in user can request group membership. |
| FR-07.4 | A group administrator can approve or reject requests. |
| FR-07.5 | A group administrator can remove members. |
| FR-07.6 | A group member can leave a group. |
| FR-07.7 | A group administrator can transfer my role. |
| FR-08.1 | A group member can read discussions, post messages, and reply. |
| FR-08.2 | A group member can receive new messages without reloading. |
| FR-09.1 | A visitor can register an account. |
| FR-09.2 | A registered user can log in and log out. |
| FR-10.1 | A logged-in user can create and manage personal movie lists. |
| FR-10.2 | A group member can use a shared movie list. |
| FR-10.3 | A list owner can share a movie list through a link. |
| FR-11.1 | A logged-in user can add and remove friends. |
| FR-11.2 | A user can see my friends' groups. |
| FR-12.1 | A user can receive personalized movie recommendations. |
| FR-13.1 | A user can view my movie activity statistics. |
| FR-14.1 | A user can use the interface in a supported language. |
| FR-15.1 | A user can have inappropriate content reviewed. |

### 2.3 Decisions Still Needed

- Confirm the release scope and all priorities, including the additional features.
- Resolve the dependency between group discussion (Should Have) and group creation/membership (currently Could Have).
- Confirm account fields, registration timing, rating increments, repeated-rating rules, review text limits, and whether a rating can be submitted without text.
- Define private-review audiences, review history, editing/deletion, public-group visibility, and whether private ratings contribute to public averages.
- Agree search filters, homepage selection rules, and the method for browsing further results.
- Confirm a suitable cinema source, Finnish coverage, and data freshness. If no source is suitable, agree a change to FR-04 rather than silently dropping a Must Have.
- Confirm group administrator transfer/removal rules and moderation responsibilities.
- Confirm list types, public sharing/revocation, friendships, recommendation inputs, activity metrics, and language scope.
- Decide whether ordinary discussion posts are sufficient or real-time delivery is needed.
- Agree representative screen sizes, usability acceptance checks, concurrent-user/load assumptions, response-time targets, and acceptable error rates. Approximately 2,000 registered users is not a concurrency target.


## 3. Non-Functional Requirements (NFR)

| ID | Requirement | Verification Method |
| --- | --- | --- |
| NFR-01 | The website must work on both mobile devices and computers. | Test on different devices and screen sizes. |
| NFR-02 | The website must support a user base of approximately 2,000 users. More specific performance targets will be agreed upon later. | Perform load testing against agreed performance targets. |
| NFR-03 | Private content must be accessible only to authorized users. | Test user roles and access permissions. |
| NFR-04 | The user interface must be clear, consistent, and easy to use. | Conduct usability testing. |


## 4. Assumptions – Not Yet Approved Requirements

| ID | Assumption |
| --- | --- |
| A-01 | The first release can be used without registration, but community features will require a user account later. |
| A-02 | Basic movie information will be retrieved from an external movie database. |
| A-03 | Group discussions will only be visible to group members. |
| A-04 | Users can submit a star rating without writing a text review. |
| A-05 | Movie theater screening information will primarily cover theaters in Finland. |


## 5. Requirements Prioritization

The original priorities below are retained as draft priorities, not recorded customer approval. Subrequirements inherit their parent priority unless explicitly marked as a proposal. Additional requirements have priority **TBD** until agreed. A dependency must be scheduled before the feature that uses it.

| Requirement | Priority |
| --- | --- |
| FR-01 | Must Have |
| FR-02 | Must Have |
| FR-03 | Could have |
| FR-04 | Must have |
| FR-05 | Must have |
| FR-06 | Must have |
| FR-07 | Could have |
| FR-08 | Should have |


## 6. User Stories and Acceptance Criteria

These stories describe desired behaviour, not completed work. Acceptance criteria are draft checks for team/customer review. Approval and implementation status must be tracked separately in GitHub.

US-01 is already used in the Sprint 1 document and is preserved. US-02–US-36 are proposed IDs for the product stories in this update. Check them against any independently created story IDs before assigning them elsewhere.

A GitHub implementation task is not a complete user story. Linked issues below identify related work; their closed state alone does not prove the whole story meets its acceptance criteria.

### US-01 — Project Documentation & Scrum Setup

**Existing technical/enabling story:** As a development team, we want to establish project documentation and Scrum practices so that we can organize, plan, and manage MovieBus development effectively.

**Source:** [Sprint 1](sprints/sprint-1.md). This update does not re-verify or change its completion claims.

**Related work:** Setup issues #1–#24 include repeated titles. Keep one authoritative task per activity after checking their history; do not count duplicates as separate deliverables.

**Review checks:** Project documentation and backlog are available; roles and workflow are recorded; approval evidence is linked where required; technical foundations have their own verification evidence.

### US-02 — Browse movies

**Story:** As a visitor, I want to browse movies without registering so that I can explore the service.

**Requirements:** FR-01.1
**Priority:** Must Have
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#25](https://github.com/naritsarkkinen/MovieBus/issues/25), [#26](https://github.com/naritsarkkinen/MovieBus/issues/26), [#29](https://github.com/naritsarkkinen/MovieBus/issues/29), [#30](https://github.com/naritsarkkinen/MovieBus/issues/30), [#32](https://github.com/naritsarkkinen/MovieBus/issues/32), [#33](https://github.com/naritsarkkinen/MovieBus/issues/33), [#34](https://github.com/naritsarkkinen/MovieBus/issues/34), [#35](https://github.com/naritsarkkinen/MovieBus/issues/35), [#42](https://github.com/naritsarkkinen/MovieBus/issues/42), [#43](https://github.com/naritsarkkinen/MovieBus/issues/43), [#44](https://github.com/naritsarkkinen/MovieBus/issues/44)

**Acceptance criteria:**

- Movie list opens without login.
- Each result shows a title and available poster, with a fallback for missing images.
- Loading, empty results, and unavailable data have clear states.

### US-03 — View movie details

**Story:** As a visitor, I want to view a selected movie's details so that I can decide whether to watch it.

**Requirements:** FR-01.2
**Priority:** Must Have
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#31](https://github.com/naritsarkkinen/MovieBus/issues/31), [#33](https://github.com/naritsarkkinen/MovieBus/issues/33), [#41](https://github.com/naritsarkkinen/MovieBus/issues/41), [#44](https://github.com/naritsarkkinen/MovieBus/issues/44)

**Acceptance criteria:**

- Selecting a movie opens the same movie's details without login.
- Available title, description, release year, genre, and poster are displayed.
- Unknown movies and missing fields are handled clearly.

### US-04 — Discover homepage movies

**Story:** As a visitor, I want to discover movies from the homepage so that I can find something to watch.

**Requirements:** FR-01.3
**Priority:** Must Have (proposed inheritance)
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#26](https://github.com/naritsarkkinen/MovieBus/issues/26), [#28](https://github.com/naritsarkkinen/MovieBus/issues/28), [#29](https://github.com/naritsarkkinen/MovieBus/issues/29)

**Acceptance criteria:**

- The homepage displays movie titles and available posters.
- Users can access search from the homepage.
- Sample data is for development, and the production selection rule must be agreed.

### US-05 — Search by title

**Story:** As a visitor, I want to search movies by title so that I can find a particular movie.

**Requirements:** FR-02.1
**Priority:** Must Have
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#36](https://github.com/naritsarkkinen/MovieBus/issues/36), [#37](https://github.com/naritsarkkinen/MovieBus/issues/37)

**Acceptance criteria:**

- Submitting a title displays matching movies without login.
- No matches produce a clear message.
- Empty input and unavailable search data are handled clearly.

### US-06 — Browse further results

**Story:** As a visitor, I want to browse more search results so that I can find movies beyond the first set.

**Requirements:** FR-02.2
**Priority:** Must Have (proposed inheritance)
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#38](https://github.com/naritsarkkinen/MovieBus/issues/38)

**Acceptance criteria:**

- Pagination or another agreed method exposes further results.
- Query and filters are retained while browsing.
- The interface indicates when no further results are available.

### US-07 — Filter results

**Story:** As a visitor, I want to filter search results so that I can narrow down my choices.

**Requirements:** FR-03.1
**Priority:** Could Have
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#39](https://github.com/naritsarkkinen/MovieBus/issues/39), [#40](https://github.com/naritsarkkinen/MovieBus/issues/40)

**Acceptance criteria:**

- Filter fields and allowed values are agreed before implementation.
- Applying and clearing filters changes results accordingly.
- No matching results produce a clear message.

### US-08 — Find cinema screenings

**Story:** As a visitor, I want to see where a movie is showing so that I can plan a cinema visit.

**Requirements:** FR-04.1
**Priority:** Must Have
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#45](https://github.com/naritsarkkinen/MovieBus/issues/45), [#46](https://github.com/naritsarkkinen/MovieBus/issues/46)

**Acceptance criteria:**

- An agreed source provides cinema, location, and screening time where available.
- No screenings and unavailable data are distinguished.
- Finnish coverage and data freshness are agreed, and lack of a suitable source requires a scope decision.

### US-09 — Rate a movie

**Story:** As a logged-in user, I want to rate a movie so that I can share my opinion.

**Requirements:** FR-05.1
**Priority:** Must Have
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#53](https://github.com/naritsarkkinen/MovieBus/issues/53), [#55](https://github.com/naritsarkkinen/MovieBus/issues/55), [#58](https://github.com/naritsarkkinen/MovieBus/issues/58)

**Acceptance criteria:**

- A valid rating is stored against its author and movie.
- The server rejects unauthenticated submissions and invalid values outside the agreed 1–5 scale.
- Text requirements and repeated-rating rules are agreed before acceptance.

### US-10 — View average ratings

**Story:** As a visitor, I want to see an average movie rating so that I can understand community opinion.

**Requirements:** FR-05.2
**Priority:** TBD — proposed
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#57](https://github.com/naritsarkkinen/MovieBus/issues/57)

**Acceptance criteria:**

- Average and count use the agreed eligible ratings.
- A movie without eligible ratings shows an unrated state.
- Whether private ratings affect public averages is agreed first.

### US-11 — Write a review

**Story:** As a logged-in user, I want to write a text review so that I can explain my opinion.

**Requirements:** FR-06.1
**Priority:** Must Have
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#54](https://github.com/naritsarkkinen/MovieBus/issues/54), [#55](https://github.com/naritsarkkinen/MovieBus/issues/55)

**Acceptance criteria:**

- A valid review is stored with its author and movie.
- The server rejects unauthenticated submissions and invalid text using agreed validation rules.
- A saved review is available only to its authorized audience.

### US-12 — Read public reviews

**Story:** As a visitor, I want to read public reviews so that I can learn what others think.

**Requirements:** FR-06.2
**Priority:** TBD — priority pending
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#56](https://github.com/naritsarkkinen/MovieBus/issues/56)

**Acceptance criteria:**

- Public reviews for the selected movie are visible without login.
- Private reviews are excluded from public responses.
- Movies without public reviews display an empty state.

### US-13 — View review history

**Story:** As a logged-in user, I want to view my previous reviews so that I can revisit my opinions.

**Requirements:** FR-06.3
**Priority:** TBD — proposed
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#59](https://github.com/naritsarkkinen/MovieBus/issues/59), [#60](https://github.com/naritsarkkinen/MovieBus/issues/60), [#61](https://github.com/naritsarkkinen/MovieBus/issues/61)

**Acceptance criteria:**

- History identifies the user's reviews and their movies.
- Another user's private history cannot be accessed.
- Create a dedicated implementation issue if approved, because the linked issues only cover related clarification.

### US-14 — Manage my reviews

**Story:** As a review author, I want to edit or delete my reviews so that I can correct or remove them.

**Requirements:** FR-06.4
**Priority:** TBD — conditional
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#59](https://github.com/naritsarkkinen/MovieBus/issues/59)

**Acceptance criteria:**

- The customer first approves editing, deletion, or both.
- Authors can perform approved actions only on their own reviews.
- The server rejects unauthorized changes and updates affected averages where applicable.

### US-15 — Choose review visibility

**Story:** As a review author, I want to choose who can read my review so that I can keep personal opinions private.

**Requirements:** FR-06.5
**Priority:** TBD — conditional
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#60](https://github.com/naritsarkkinen/MovieBus/issues/60), [#61](https://github.com/naritsarkkinen/MovieBus/issues/61)

**Acceptance criteria:**

- The private audience, default visibility, and available choices are agreed first.
- Visibility is stored and enforced by the backend.
- Direct API requests cannot bypass private-review permissions.

### US-16 — Create a group

**Story:** As a logged-in user, I want to create a movie group so that I can discuss movies with others.

**Requirements:** FR-07.1
**Priority:** Could Have
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#62](https://github.com/naritsarkkinen/MovieBus/issues/62), [#63](https://github.com/naritsarkkinen/MovieBus/issues/63)

**Acceptance criteria:**

- Valid authenticated requests create a group with agreed required data.
- The creator receives the agreed initial administrator role.
- Invalid and unauthenticated requests are rejected.

### US-17 — Discover groups

**Story:** As a user, I want to find groups and view their details so that I can choose a community to join.

**Requirements:** FR-07.2
**Priority:** Could Have (proposed inheritance)
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#64](https://github.com/naritsarkkinen/MovieBus/issues/64), [#65](https://github.com/naritsarkkinen/MovieBus/issues/65)

**Acceptance criteria:**

- Groups are listed according to agreed visibility rules.
- A group page shows permitted information and joining options.
- Public pages do not expose private member content.

### US-18 — Request membership

**Story:** As a logged-in user, I want to request group membership so that I can join a community.

**Requirements:** FR-07.3
**Priority:** Could Have (proposed inheritance)
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#66](https://github.com/naritsarkkinen/MovieBus/issues/66)

**Acceptance criteria:**

- Eligible non-members can submit a request.
- Pending status is visible and duplicate pending requests are prevented.
- Pending requests do not grant member-only access.

### US-19 — Decide membership requests

**Story:** As a group administrator, I want to approve or reject requests so that I can manage membership.

**Requirements:** FR-07.4
**Priority:** Could Have (proposed inheritance)
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#67](https://github.com/naritsarkkinen/MovieBus/issues/67), [#70](https://github.com/naritsarkkinen/MovieBus/issues/70)

**Acceptance criteria:**

- Administrators can view pending requests for their own group.
- Approval grants membership and rejection does not.
- The server rejects decisions by unauthorized users.

### US-20 — Remove members

**Story:** As a group administrator, I want to remove members so that I can manage my group.

**Requirements:** FR-07.5
**Priority:** Could Have (proposed inheritance)
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#68](https://github.com/naritsarkkinen/MovieBus/issues/68), [#70](https://github.com/naritsarkkinen/MovieBus/issues/70)

**Acceptance criteria:**

- Authorized administrators can remove eligible members.
- Removed members lose private group access.
- Rules for removing administrators and protecting the last administrator are agreed first.

### US-21 — Leave a group

**Story:** As a group member, I want to leave a group so that I can manage my memberships.

**Requirements:** FR-07.6
**Priority:** Could Have (proposed inheritance)
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#69](https://github.com/naritsarkkinen/MovieBus/issues/69)

**Acceptance criteria:**

- Members can leave and lose private group access.
- The leave action cannot remove someone else.
- The last-administrator case follows an agreed rule.

### US-22 — Transfer administration

**Story:** As a group administrator, I want to transfer my role so that I can let another member manage the group.

**Requirements:** FR-07.7
**Priority:** Could Have (proposed inheritance)
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#70](https://github.com/naritsarkkinen/MovieBus/issues/70), [#71](https://github.com/naritsarkkinen/MovieBus/issues/71)

**Acceptance criteria:**

- Only an authorized administrator can initiate a transfer.
- The recipient is an eligible group member.
- Resulting roles follow agreed transfer rules without unauthorized privilege changes.

### US-23 — Discuss movies in groups

**Story:** As a group member, I want to read discussions, post messages, and reply so that I can exchange ideas with my group.

**Requirements:** FR-08.1
**Priority:** Should Have
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#72](https://github.com/naritsarkkinen/MovieBus/issues/72), [#73](https://github.com/naritsarkkinen/MovieBus/issues/73)

**Acceptance criteria:**

- Authorized members can read and submit valid posts and replies.
- Posts identify their author and replies retain their parent relationship.
- Private discussions are inaccessible to non-members, while public-group discussion rules require confirmation.

### US-24 — Receive live discussion updates

**Story:** As a group member, I want to receive new messages without reloading so that I can follow an active discussion.

**Requirements:** FR-08.2
**Priority:** TBD — conditional
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#74](https://github.com/naritsarkkinen/MovieBus/issues/74), [#75](https://github.com/naritsarkkinen/MovieBus/issues/75)

**Acceptance criteria:**

- Real-time delivery is implemented only if approved.
- Agreed delivery and reconnection behaviour is checked with two sessions.
- Private messages are delivered only to authorized members.

### US-25 — Register an account

**Story:** As a visitor, I want to register an account so that I can use member features.

**Requirements:** FR-09.1
**Priority:** TBD — proposed dependency
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#47](https://github.com/naritsarkkinen/MovieBus/issues/47), [#48](https://github.com/naritsarkkinen/MovieBus/issues/48), [#50](https://github.com/naritsarkkinen/MovieBus/issues/50)

**Acceptance criteria:**

- Valid registration creates an account using agreed fields and uniqueness rules.
- Invalid or duplicate data produces a useful error.
- Passwords are stored as secure hashes and never returned in API responses.

### US-26 — Log in and log out

**Story:** As a registered user, I want to log in and log out so that I can access my account securely.

**Requirements:** FR-09.2
**Priority:** TBD — proposed dependency
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#49](https://github.com/naritsarkkinen/MovieBus/issues/49), [#51](https://github.com/naritsarkkinen/MovieBus/issues/51), [#52](https://github.com/naritsarkkinen/MovieBus/issues/52)

**Acceptance criteria:**

- Valid credentials establish authenticated access and invalid credentials do not.
- Logout ends the current authenticated session according to the chosen design.
- Expired or missing credentials cannot access protected operations.

### US-27 — Manage personal lists

**Story:** As a logged-in user, I want to create and manage personal movie lists so that I can organize movies.

**Requirements:** FR-10.1
**Priority:** TBD — conditional
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#77](https://github.com/naritsarkkinen/MovieBus/issues/77), [#78](https://github.com/naritsarkkinen/MovieBus/issues/78), [#79](https://github.com/naritsarkkinen/MovieBus/issues/79)

**Acceptance criteria:**

- List types, management actions, and duplicate rules are agreed first.
- Owners can create lists and add or remove movies with changes retained after reload.
- Other users cannot modify lists without an approved permission.

### US-28 — Manage group lists

**Story:** As a group member, I want to use a shared movie list so that I can plan movies with my group.

**Requirements:** FR-10.2
**Priority:** TBD — conditional
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#80](https://github.com/naritsarkkinen/MovieBus/issues/80), [#81](https://github.com/naritsarkkinen/MovieBus/issues/81)

**Acceptance criteria:**

- List visibility and editing roles are agreed before implementation.
- Authorized users can perform approved list actions.
- Unauthorized users cannot read private lists or change group lists.

### US-29 — Share lists publicly

**Story:** As a list owner, I want to share a movie list through a link so that I can let people without accounts view it.

**Requirements:** FR-10.3
**Priority:** TBD — conditional
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#82](https://github.com/naritsarkkinen/MovieBus/issues/82)

**Acceptance criteria:**

- An authorized owner can share an eligible list if approved.
- A logged-out visitor can view the shared list without editing it.
- Eligible content, revocation, and private-content handling are agreed first.

### US-30 — Manage friendships

**Story:** As a logged-in user, I want to add and remove friends so that I can manage my social connections.

**Requirements:** FR-11.1
**Priority:** TBD — conditional
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#83](https://github.com/naritsarkkinen/MovieBus/issues/83), [#84](https://github.com/naritsarkkinen/MovieBus/issues/84)

**Acceptance criteria:**

- The customer decides whether friendship needs mutual acceptance.
- Adding and removing relationships follows that process.
- Users cannot change relationships on behalf of another account.

### US-31 — View friends' groups

**Story:** As a user, I want to see my friends' groups so that I can discover relevant communities.

**Requirements:** FR-11.2
**Priority:** TBD — conditional
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#83](https://github.com/naritsarkkinen/MovieBus/issues/83), [#85](https://github.com/naritsarkkinen/MovieBus/issues/85)

**Acceptance criteria:**

- Only memberships allowed by agreed privacy rules are displayed.
- Visible membership does not grant private group access.
- Hidden memberships are not exposed by API responses.

### US-32 — Receive recommendations

**Story:** As a user, I want to receive personalized movie recommendations so that I can discover relevant movies.

**Requirements:** FR-12.1
**Priority:** TBD — conditional
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#86](https://github.com/naritsarkkinen/MovieBus/issues/86), [#87](https://github.com/naritsarkkinen/MovieBus/issues/87)

**Acceptance criteria:**

- Inputs, personal-data use, and recommendation rules are agreed first.
- Results follow agreed criteria using available data.
- Users without enough input data receive an agreed fallback.

### US-33 — View activity statistics

**Story:** As a user, I want to view my movie activity statistics so that I can track my activity.

**Requirements:** FR-13.1
**Priority:** TBD — conditional
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#88](https://github.com/naritsarkkinen/MovieBus/issues/88), [#89](https://github.com/naritsarkkinen/MovieBus/issues/89)

**Acceptance criteria:**

- Metrics and how watched movies or other activity are recorded are agreed first.
- Statistics use recorded data and handle an empty history.
- Private statistics are not exposed to other users.

### US-34 — Use supported languages

**Story:** As a user, I want to use the interface in a supported language so that I can understand the service.

**Requirements:** FR-14.1
**Priority:** TBD — clarification pending
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#90](https://github.com/naritsarkkinen/MovieBus/issues/90), [#91](https://github.com/naritsarkkinen/MovieBus/issues/91)

**Acceptance criteria:**

- Finnish as the primary language and any English or Swedish support are confirmed.
- Navigation, forms, and system messages use the agreed language.
- If switching is approved it works for supported interface languages, with external movie text coverage documented separately.

### US-35 — Report and moderate content

**Story:** As a user, I want to have inappropriate content reviewed so that I can use a welcoming community.

**Requirements:** FR-15.1
**Priority:** TBD — proposed
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#76](https://github.com/naritsarkkinen/MovieBus/issues/76), [#70](https://github.com/naritsarkkinen/MovieBus/issues/70)

**Acceptance criteria:**

- Reporting scope, moderation roles, and actions are agreed first.
- Users can report supported content and authorized moderators can review it.
- Moderators can act only within their agreed scope, without default site-wide powers for group administrators.

### US-36 — Use MovieBus on mobile

**Story:** As a mobile user, I want to use readable pages and controls so that I can access MovieBus on my phone.

**Requirements:** NFR-01 / NFR-04
**Priority:** TBD — priority pending
**Status:** Proposed — pending review/approval
**Related GitHub tasks:** [#27](https://github.com/naritsarkkinen/MovieBus/issues/27), [#101](https://github.com/naritsarkkinen/MovieBus/issues/101), [#102](https://github.com/naritsarkkinen/MovieBus/issues/102)

**Acceptance criteria:**

- Core navigation, movie pages, forms, and approved community flows are checked at agreed screen sizes.
- Controls remain usable without unintended horizontal scrolling.
- Usability findings are recorded and blocking problems are fixed.

### 6.1 Technical, Quality, and Delivery Backlog

The user stories above cover product behaviour. The following tasks support implementation and verification; they should not be rewritten as artificial end-user stories.

| Area | Existing issues | Relationship |
| --- | --- | --- |
| Planning and environment | #1–#24 | Requirements approval, architecture, ERD, backlog, priorities, repository, workflow, Azure, local environment, deployment, and team roles. #13–#24 repeat the titles of #1–#12 and need reconciliation. |
| Frontend and integration foundations | #25, #26, #29, #32, #35, #42–#44 | Support browsing, details, and search stories. Sample UI data is not proof of a working backend/TMDB flow. |
| Account and permissions foundations | #47, #50–#52, #62, #70, #73 | Support account, review, group, and privacy stories. |
| API and user-flow tests | #92–#97 | Verify implemented endpoints, account flows, movie discovery, reviews, and groups. Existing sample API tests alone do not verify these future features. |
| Permissions, validation, and security | #98–#100 | Verify NFR-03 and the relevant story acceptance criteria. |
| Device and usability checks | #101–#102 | Verify NFR-01 and NFR-04. |
| Bug fixes | #103 | Resolve problems found during acceptance checks and testing. |
| Performance and load | #104–#105 | Verify NFR-02 after numeric targets and load assumptions are agreed. |
| Production and handover | #106–#109 | Prepare production, deploy, write user/deployment documentation, and record final customer acceptance. |

Issues #39, #45, #59–#60, #74, #77, #80, #83, #86, #88, and #90 contain clarification or investigation work. Resolving those questions does not itself implement the resulting feature.

### 6.2 Acceptance and Completion

- A story is accepted only after its agreed acceptance criteria and the [Definition of Done](definition-of-done.md) are met.
- A layout with sample data can complete a layout task, but does not complete a story requiring live data, saved user actions, or backend permissions.
- Merge and test evidence must identify the branch and scope. Integration-branch checks are not automatically production acceptance.
- Record customer/supervisor approval separately from issue closure, code review, and deployment.
- Add missing implementation tasks when a proposed story is approved, particularly review history.


## 7. Approval and Change Management

- **Requirements approval:** Pending customer/supervisor approval.
- **Updates:** Requirements may be refined throughout the project.
- **Product Backlog:** Approved and prioritized requirements will be used to create Product Backlog items and User Stories in GitHub Projects.
- **Technical design:** Architecture, database design, and technology choices will be documented separately in the technical specification.

### 7.1 Change Log

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | Previous draft | Initial requirements, assumptions, and draft priorities. |
| 0.2 | 9 November 2026 | Added detailed requirement IDs, proposed product stories with acceptance criteria and task links, open decisions, and technical/quality backlog mapping. Preserved US-01 and pending approval status. |
