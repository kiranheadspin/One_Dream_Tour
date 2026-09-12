export const publicPages = {
  tournament: {
    eyebrow: "Tournament overview", title: "The 50th edition, built for corporate cricket.", intro: "One Dream Cup is a pure corporate tennis-ball cricket tournament across four city leagues, with eight qualifying teams progressing to Goa.",
    sections: [
      { title: "Tournament format", body: "Each city competition includes league matches, pre-quarter-finals, quarter-finals and semi-finals. The top two teams from each host city progress to the quarter-finals in Goa." },
      { title: "Who can enter", body: "Teams must represent a company. Eligibility evidence and any final squad requirements will be shared during registration and remain configurable by the tournament administrator." },
      { title: "Confirmed city dates", body: "Bangalore: 21–22 November 2026; Pune: 12–13 December 2026; Hyderabad: 19–20 December 2026; Chennai: 30–31 January 2027. Venues and registration deadlines will be published after confirmation." },
    ],
  },
  "road-to-goa": {
    eyebrow: "Road to Goa", title: "Four cities. Eight qualifiers. One final stage.", intro: "The journey begins in Bangalore, Chennai, Hyderabad and Pune, then converges in Goa for the quarter-finals and title rounds.",
    sections: [
      { title: "1. City competition", body: "Corporate teams progress through league matches, pre-quarter-finals, quarter-finals and semi-finals in their host city." },
      { title: "2. City qualification", body: "The top two teams from each host city earn their place in the eight-team Goa quarter-finals and receive ₹10,000 each." },
      { title: "3. Goa finals", body: "Quarter-finals, semi-finals and the championship match complete the 50th Special Edition. Exact Goa dates and venue are not yet published." },
    ],
  },
  rules: {
    eyebrow: "Rules & eligibility", title: "Clear enough to compete. Final before you commit.", intro: "The core tournament format is confirmed. Detailed match rules, squad limits and documentary requirements will be versioned and accepted during registration.",
    sections: [
      { title: "Known format", body: "Corporate teams only; tennis-ball cricket; city league, pre-quarter-final, quarter-final and semi-final stages; two qualifiers per host city; eight-team knockout finals in Goa." },
      { title: "To be confirmed", body: "Final squad limits, substitutes, player eligibility evidence, playing conditions, tie-break rules and disciplinary process will be published by the administrator before acceptance." },
      { title: "Versioned acceptance", body: "Captains accept a dated rules version from their dashboard. The system records the acceptance time and does not silently replace accepted terms." },
    ],
  },
  sponsors: {
    eyebrow: "Partnerships", title: "Meet corporate communities through the game.", intro: "One Dream Cup offers a multi-city corporate sports platform. Partnership inventory is developed against confirmed tournament operations rather than invented packages.",
    sections: [
      { title: "Brand partnerships", body: "Discuss event presence, content, team engagement and the Goa finals experience with the One Dream Group team." },
      { title: "No unverified claims", body: "Audience numbers, venue inventory and media deliverables will be included only after they are confirmed in a written partnership proposal." },
    ],
  },
  "corporate-events": {
    eyebrow: "Beyond the Cup", title: "Company experiences that bring people together.", intro: "One Dream Group can discuss corporate cricket, employee engagement and team experiences beyond the tournament itself.",
    sections: [
      { title: "Built around your organisation", body: "Share your team size, city, objectives and preferred window. We will shape a verified scope rather than offer an invented one-size package." },
      { title: "Future interest", body: "The public enquiry separates operational permission for this tournament from optional permission to hear about future events." },
    ],
  },
  contact: {
    eyebrow: "Contact", title: "Talk to the One Dream Cup team.", intro: "For team enquiries, eligibility questions, partnerships or corporate events, use the short enquiry or WhatsApp the operations team.",
    sections: [
      { title: "WhatsApp", body: "+91 9591011861. Include your company, city and enquiry reference if you have one." },
      { title: "Registration help", body: "Submitting an enquiry does not reserve a slot. The team will confirm availability and send a registration invitation when appropriate." },
    ],
  },
  privacy: {
    eyebrow: "Privacy notice", title: "Your details are for clear, limited purposes.", intro: "Template for qualified legal review before launch. The product records operational and marketing permissions separately, limits captain access to their own team and maintains an audit trail for administrative actions.",
    sections: [
      { title: "Information we collect", body: "Captain contact details, company relationship, team preferences, source information, consent records and—only after invitation—team registration and payment references." },
      { title: "Why we use it", body: "Operational data is used to respond, verify eligibility, manage registration, communicate tournament updates and administer payments. Marketing use requires separate optional permission." },
      { title: "Control and retention", body: "You may ask to correct your data or withdraw optional marketing permission. Operational and financial records may be retained where needed for legitimate administration, dispute handling and legal obligations." },
    ],
  },
  terms: {
    eyebrow: "Website terms", title: "Information first. Commitment only after confirmation.", intro: "Template for qualified legal review before launch. Public tournament information may change until exact operational details are confirmed by One Dream Group.",
    sections: [
      { title: "Enquiry status", body: "A public enquiry is not registration, a slot reservation or a payment obligation. Confirmation is provided separately by the operations team." },
      { title: "Accurate submissions", body: "Captains should provide accurate company and contact information and may access only their authorised team records." },
      { title: "Final tournament terms", body: "Verified dates, venues, playing rules, eligibility, GST treatment, payment schedule and refund terms will be presented before any binding acceptance or payment." },
    ],
  },
  "refund-policy": {
    eyebrow: "Refund policy", title: "No payment is taken at enquiry.", intro: "The ₹14,500 team fee is requested only after a registration invitation. Exact GST treatment, payment schedule and refund terms are not yet published.",
    sections: [
      { title: "Before payment", body: "The applicable refund terms will be shown with the confirmed tournament details and must be reviewed before payment." },
      { title: "After payment", body: "Payment and refund events are recorded separately with provider references. Contact the operations team with your registration and payment references for support." },
    ],
  },
} as const;

export type PublicPageSlug = keyof typeof publicPages;
