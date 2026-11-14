<!--
Sync Impact Report
Version change: 1.0.0 → 2.0.0 (approved per-tab session storage replaces shared identity)
Modified principles: III. Local Relational Persistence → III. Shared Data and Per-Tab Sessions.
Rationale: user requested parallel Cliente/Admin tabs; a shared Session is no longer permitted.
Compatibility: preserve existing shared tables; retire legacy shared Session without inheriting it.
Added sections: none.
Removed sections: none.
Follow-up TODOs: none.
-->
# CyberMarket Constitution

## Core Principles

### I. Product and Role Separation
CyberMarket MUST provide distinct Cliente and Admin experiences. Cliente features MUST include
the store, product search and filters, profile management for phone and addresses, purchase
tracking, cart, and simulated checkout. Admin navigation and entry points MUST be completely
hidden from Cliente users. Admin features MUST be available only after authentication against
the predefined credentials `admin@cybermarket.com` / `admin123`, and MUST include product CRUD,
shipping-status operations, customer management, and metrics dashboard. Role checks MUST also
guard protected views and actions, not only navigation. This protects the role boundary and keeps
customer and operator workflows clear.

### II. Mandatory Technology and Lightweight Design
The application MUST use React with Vite, TailwindCSS with a dark, technology-first visual
system, Lucide React icons, and React Router DOM. It MUST NOT add a backend service, external
database, or heavyweight third-party dependency. Any additional dependency MUST be lightweight,
necessary for a stated requirement, and justified in the feature design.

### III. Shared Data and Per-Tab Sessions
Products, Categories, Customers and Orders MUST remain shared in `localStorage` for the same origin
and browser profile. The active Session MUST instead be stored in `sessionStorage` under
`cybermarket_session`, independently for each tab. Signing in or out MUST NOT change another tab's
identity. Every service MUST authorize operations against its own tab's Session and the latest
shared records. Shared writes MUST update open views through storage subscriptions without reload.
Orders and inventory MUST retain one canonical atomic document; named collection projections MUST
NOT become competing transaction sources. A legacy shared Session MUST NOT grant access to a new
tab. Existing customers, orders and inventory MUST be preserved during this change; one login per
tab may be required after migration. Data access MUST remain isolated from UI components and MUST
preserve validated, versioned relationships. Corrupt data MUST fail safely without silently
resetting shared records. This separation enables parallel Cliente/Admin testing without mixing
permissions or creating independent stores.

### IV. Secure and Explicit Simulation
Checkout and payment MUST be clearly presented as simulations and MUST NOT collect or transmit
real payment credentials. The predefined administrator credential is a local demo mechanism only,
not production-grade authentication; documentation and UI MUST make that limitation clear. User
input MUST be validated before persistence or use in state-changing operations.

### V. Verifiable User Journeys
Each feature MUST define acceptance criteria and be verifiable through tests or repeatable manual
checks. Tests MUST cover role-based access and the primary customer journey (search, cart,
checkout, order tracking) as well as administrator product and shipping workflows. Accessibility,
responsive behavior, and clear empty, loading, and error states MUST be considered for each view.

## Quality and Delivery

Features MUST be delivered in small, independently reviewable increments. A change is complete
only when its acceptance criteria are met, relevant tests pass, and its behavior is documented
where needed. The interface MUST remain usable on mobile and desktop, support keyboard navigation,
and expose accessible names for icon-only controls. Visual consistency MUST be maintained through
shared Tailwind design tokens or reusable components rather than duplicated one-off styling.

## Data and Scope Constraints

`localStorage` is browser-local and is not a secure or shared database. The application MUST avoid
storing sensitive real-world personal or payment data. The data model and UI MUST clearly treat
orders, customers, shipping, and metrics as locally simulated demo data. Cross-device persistence,
real payment processing, live carrier integration, and multi-user synchronization are out of scope
unless explicitly approved in a future specification and accompanied by a constitution amendment.

## Governance

This constitution governs feature specifications, plans, implementation, and review. An amendment
requires an explicit rationale, review of affected features and data compatibility, and approval
from the project owner. Amendments MUST update the version and last-amended date: MAJOR for
backward-incompatible changes to principles, MINOR for new principles or materially expanded
requirements, and PATCH for clarifications that do not change obligations. Every feature review
MUST check compliance with applicable principles; any exception MUST be documented, justified,
and approved before implementation.

**Version**: 2.0.0 | **Ratified**: 2026-11-05 | **Last Amended**: 2026-11-14
