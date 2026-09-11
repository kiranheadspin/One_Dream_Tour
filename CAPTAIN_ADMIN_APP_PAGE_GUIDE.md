# Captain and Admin App Page Guide

This document explains the current pages in the Captain app and Admin app, what each page is for, and what it contains today.

## Shared access

### Login

The Login page gives captains and administrators secure access to their own workspace. In demo mode, it has separate buttons for the Captain portal and Admin CRM. In production mode, it sends a passwordless sign-in link to the user's work email. Each role can access only its permitted app.

## Captain app

| Page | What it does | What it has now |
| --- | --- | --- |
| **Overview** | Shows the captain's overall registration status and next action. | Team and company summary, city, registration badge, progress bar, step checklist, next-action card, and a notice when operational details are still unconfirmed. |
| **Team & Players** | Lets the captain review the team and maintain its player roster. | Team, company and city details; a player table with contact, employee ID, shirt size and status; and an **Add player** form. A captain can manage only their own team. |
| **Rules** | Presents the current rules version and records the captain's acceptance. | Draft rules summary, confirmed tournament format, qualification information, clearly marked pending rules, acceptance checkbox, and acceptance date/time after submission. |
| **Documents** | Explains whether registration documents are required. | An informational empty state because no document requirements are currently published. Upload controls are not open yet. |
| **Payment** | Lets the captain pay the registration fee by UPI and request organizer verification. | Total fee, UPI QR, UPI ID, payee name, payment phone, Google Pay/PhonePe/Paytm/any-UPI acceptance icons, a mobile **Make payment** link with prefilled payee and amount, a **Payment done** review action, organizer contact, and team payment history. A request remains pending until an administrator confirms receipt. |
| **Confirmation** | Tells the captain whether registration is complete. | A registered message after payment, or an in-progress message when steps remain, plus a link back to the Overview. |
| **Announcements** | Provides official tournament and operational updates. | An empty state until the organizer publishes confirmed schedule, venue or tournament announcements. |
| **Preferences** | Manages optional marketing communication consent. | A future-event marketing checkbox, save/withdraw action, explanation separating marketing from operational messages, and a data-request link. |
| **Captain Profile** | Displays the signed-in captain's account information. | Name, primary email, role and authentication method. This page exists but is not currently linked in the main navigation. |
| **Schedule** | Displays confirmed match dates, times and venues. | An awaiting-publication message because exact schedule details are not configured. This page exists but is not currently linked in the main navigation. |
| **Receipt** | Provides a payment acknowledgement after a successful payment. | Team, company, city, paid amount, payment reference and a **Print or save PDF** button. It is available only after a paid payment record exists and is not currently linked in the main navigation. |

## Admin app

| Page | What it does | What it has now |
| --- | --- | --- |
| **Overview** | Gives administrators a quick view of registration operations. | Metrics for active leads, registered teams, follow-ups due and recorded payments, plus a recent-leads table. |
| **Leads** | Manages enquiries in the CRM pipeline. | Search by captain, company, email or reference; city and stage filters; inline stage updates; lead list; lead-detail links; and CSV export. |
| **Lead Details** | Shows a complete enquiry and its operational actions. | Contact and company information, enquiry answers, source and campaign, current stage, owner assignment, next follow-up, an action that records the **Registration invited** stage, email and WhatsApp links, consent status and creation time. |
| **Teams** | Shows invited and registered teams. | Team cards with company, city, registration status, captain, player count and payment status. |
| **Payments** | Gives administrators a record of payment activity and a receipt-confirmation queue. | Awaiting/confirmed/received totals; team, captain, company, amount, status, UPI transaction and internal references; submission time; and a **Review** action that registers the team only after the organizer confirms the money was received. Demo records do not move real money. |
| **Reports** | Summarizes the current lead pipeline. | Lead counts by city and a registration conversion percentage based on registered leads divided by all leads. |
| **Content** | Tracks operational information that still needs approval before publication. | Pending items for city dates, deadlines, venues, rules, Goa schedule, sponsor details, announcements and public policy versions. It currently shows status only; editing controls are not yet enabled. |
| **Settings** | Controls operational and commercial readiness. | The payment-readiness rule and current demo payment setting. Production UPI submission remains blocked until the organizer payment details and required commercial terms are configured and payments are explicitly enabled. |

### Protected admin modules prepared for later expansion

The app also has protected pages for **Companies, Captains, Players, Tournaments, City Qualifiers, Registrations, Follow-ups, Communications,** and **Audit Log**. These pages currently explain the purpose of each module and confirm that its database schema and authorization are ready. Full create and edit controls are not yet implemented because the organizer's policies and required fields still need confirmation.

## Shared app behavior

- Both apps have role-protected access, a demo-workspace notice when sample data is active, and a sign-out action.
- Desktop uses a full sidebar. The mobile header keeps every captain and administrator destination in a horizontally scrollable navigation row, including Payment and Confirmation.
- Unconfirmed dates, venues, rules, document requirements and commercial terms are labelled as pending instead of being shown as final information.
