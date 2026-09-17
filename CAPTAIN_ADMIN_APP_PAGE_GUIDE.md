# Captain and Admin App Page Guide

This document explains the current public, Captain and Admin pages, what each page is for, and what it contains today.

## Public site

The homepage includes an **Official schedule announcements** section. It lists up to six upcoming published fixtures with the teams, round, match number, IST date/time and venue. Drafts, cancelled fixtures and captain-only notes are not exposed publicly.

## Shared access

### Login

The Login page gives captains and administrators secure access to their own workspace. In demo mode, it has separate buttons for the Captain portal and Admin CRM. In production mode, captains use an organizer-issued username and password, while administrators use an approved email and password. Each role can access only its permitted app.

## Captain app

| Page | What it does | What it has now |
| --- | --- | --- |
| **Overview** | Shows the captain's overall registration status and next action. | Team and company summary, city, registration badge, progress bar, step checklist, next-action card, and a notice when operational details are still unconfirmed. |
| **Team & Players** | Lets the captain review the team and maintain its player roster. | Team, company and city details; a player table with contact, employee ID and optional PF/EPFO number; and an **Add player** form. A captain can manage only their own team. |
| **Rules** | Presents the current rules version and records the captain's acceptance. | S50 brochure rules and source PDF, shared public/captain wording, unresolved details, a version-specific acceptance checkbox, and the recorded version and timestamp. Previous draft acceptance requires review of the current version. |
| **Documents** | Explains whether registration documents are required. | Employment-evidence requirements and PF verification guidance from the S50 brochure. PF entry is optional while saving the roster; PF is required during eligibility verification. Online uploads are not available. |
| **Payment** | Lets the captain pay the registration fee by UPI and request organizer verification. | Total fee, UPI QR, UPI ID, payee name, payment phone, Google Pay/PhonePe/Paytm/any-UPI acceptance icons, a mobile **Make payment** link with prefilled payee and amount, a **Payment done** review action, organizer contact, and team payment history. A request remains pending until an administrator confirms receipt. |
| **Confirmation** | Tells the captain whether registration is complete. | A registered message after payment, or an in-progress message when steps remain, plus a link back to the Overview. |
| **Announcements** | Provides official tournament and operational updates. | Published updates relevant to the captain, including an automatically maintained announcement for every published fixture. |
| **Preferences** | Manages optional marketing communication consent. | A future-event marketing checkbox, save/withdraw action, explanation separating marketing from operational messages, and a data-request link. |
| **Captain Profile** | Displays the signed-in captain's account information. | Name, username, role and password authentication method. This page exists but is not currently linked in the main navigation. |
| **Schedule** | Displays confirmed match dates, times and venues. | A personalized fixture list with opponent, round, match number, IST date/time, venue, captain note and WhatsApp sharing. Drafts and other teams' fixtures remain hidden. |
| **Receipt** | Provides a payment acknowledgement after a successful payment. | Team, company, city, paid amount, payment reference and a **Print or save PDF** button. It is available only after a paid payment record exists and is not currently linked in the main navigation. |

## Admin app

| Page | What it does | What it has now |
| --- | --- | --- |
| **Overview** | Gives administrators a quick view of registration operations. | Metrics for active leads, registered teams, follow-ups due and recorded payments, a captain-access queue, plus a recent-leads table. |
| **Leads** | Manages enquiries in the CRM pipeline. | Search by captain, company, email or reference; city and stage filters; inline stage updates; lead list; lead-detail links; and CSV export. |
| **Lead Details** | Shows a complete enquiry and its operational actions. | Contact and company information, enquiry answers, source and campaign, current stage, owner assignment, next follow-up, captain username and one-time activation-link generation, WhatsApp sharing, consent status and creation time. |
| **Teams** | Shows invited and registered teams. | Team cards with company, city, registration status, captain, player count and payment status. |
| **Schedule** | Builds and publishes verified tournament fixtures. | Add, edit and delete venues; create, edit and delete fixtures; draft, published and cancelled states; team and venue overlap protection; IST date/time entry; captain notes; automatic announcement updates; and shareable WhatsApp copy. |
| **Payments** | Gives administrators a record of payment activity and a receipt-confirmation queue. | Awaiting/confirmed/received totals; team, captain, company, amount, status, UPI transaction and internal references; submission time; and a **Review** action that registers the team only after the organizer confirms the money was received. Demo records do not move real money. |
| **Reports** | Summarizes the current lead pipeline. | Lead counts by city and a registration conversion percentage based on registered leads divided by all leads. |
| **Content** | Tracks operational information that still needs approval before publication. | Links to the S50 rules and source brochure, plus outstanding squad, substitute, knockout, tie-break, venue, deadline, Goa and policy details. Fixture editing is available through Schedule. |
| **Settings** | Controls operational and commercial readiness. | The payment-readiness rule and current demo payment setting. Production UPI submission remains blocked until the organizer payment details and required commercial terms are configured and payments are explicitly enabled. |

### Protected admin modules prepared for later expansion

The app also has protected pages for **Companies, Captains, Players, Tournaments, City Qualifiers, Registrations, Follow-ups, Communications,** and **Audit Log**. These pages currently explain the purpose of each module and confirm that its database schema and authorization are ready. Full create and edit controls are not yet implemented because the organizer's policies and required fields still need confirmation.

## Shared app behavior

- Both apps have role-protected access, a demo-workspace notice when sample data is active, and a sign-out action.
- Desktop uses a full sidebar. The mobile header keeps every captain and administrator destination in a horizontally scrollable navigation row, including Payment and Confirmation.
- Confirmed S50 city dates, playing rules and employment evidence are published. Unknown squad limits, substitutes, knockout overs, tie-breaks, Goa dates, venues and commercial terms remain pending.
- Schedule publishing is draft-first. Publishing exposes the confirmed matchup, IST date/time and venue on the public homepage and to the two participating captains. Captains additionally receive the fixture in their Schedule, Announcements and Overview pages; captain notes remain private. Unpublishing or deleting the fixture removes it from those published surfaces.
