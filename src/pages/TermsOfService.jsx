import { Link } from 'react-router-dom';

// Placeholder values that must be finalised by the business owner / legal adviser.
// Flagged in IAA_FINAL_PRE_RELEASE_AUDIT.md as BLUE (client/legal decision required).
const CONTACT_EMAIL = 'seantinashenyakutira@gmail.com'; // support email used in platform settings
const OPERATOR = 'I Am An Artist (the platform operator)'; // TODO: confirm legal entity name & registration
const JURISDICTION = 'Zambia'; // TODO: confirm governing law & courts — LEGAL DECISION REQUIRED

const Sections = [
  {
    title: '1. Introduction',
    body: `Welcome to I Am An Artist, an online art marketplace operated by ${OPERATOR} (collectively, "we", "us", "our"). These Terms & Conditions ("Terms") govern your access to and use of the I Am An Artist web application, Android app and iOS app (the "App") and the services we provide, including buying and selling artwork, galleries, exhibitions, creative communities and messaging. By creating an account or using the App you agree to these Terms. If you do not agree, please do not use the App.`,
  },
  {
    title: '2. Accounts and responsibility',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must provide accurate information and keep it up to date. You must be at least the minimum age required by applicable law in your country to use the App. We may suspend or terminate accounts that violate these Terms, applicable law or the rights of others.',
  },
  {
    title: '3. Roles on the platform',
    body: 'The App supports several account types:',
    items: [
      ['Users / Collectors (Buyers)', 'Browse artwork, contact artists, make purchases and use collections, galleries and messaging.'],
      ['Artists (Sellers)', 'Create profiles, upload and list artwork, manage exhibitions, and sell artwork through the marketplace. Artist verification (with identity document and NRC/phone information) is available and, when approved, marks you as a verified artist.'],
      ['Admins', 'Platform administrators who manage users, artwork, moderation, settings, and commerce records.'],
      ['Couriers', 'Optional delivery partners who manage deliveries and payouts.'],
    ],
  },
  {
    title: '4. Artwork listings and pricing',
    body: 'Artists are responsible for the accuracy, legality and rights of the artwork they list. Listings must include a lawful price in Zambian Kwacha (ZMW). The platform does not set the price of artwork; prices are set by the artist. Listed artwork remains the artist\'s responsibility until a sale is finalised. We may remove listings that violate these Terms, platform policies or applicable law.',
  },
  {
    title: '5. Purchases, orders and service charge',
    body: 'When you purchase artwork, you agree to pay the displayed price plus any applicable charges. Orders are created per artwork. The platform charges a fixed (non-percentage) service charge on artwork sales, deducted from the artist\'s payout (seller-paid), as set out below. The current schedule is:',
    items: [
      ['K1 – K250', 'K2'],
      ['K251 – K1,000', 'K5'],
      ['K1,001 – K2,500', 'K10'],
      ['K2,501 – K5,000', 'K20'],
      ['K5,001 – K10,000', 'K40'],
      ['K10,001 and above', 'K75'],
    ],
    note: 'This schedule is a fixed platform service charge per artwork piece. It is not a percentage commission. The current active schedule is published in our marketplace documentation/Pricing page and may be updated from time to time by the operator. Buyers pay the artwork price only; the fixed charge is borne by the seller/artist.',
  },
  {
    title: '6. Payouts to artists',
    body: 'When an order is completed and paid, the artist earns the sale price less the fixed platform service charge. Payments are recorded as pending payouts and are released to the artist once the buyer confirms delivery or after the applicable release period. Payouts are recorded on the platform; the method and timing of actual money movement are set out in our Seller/Artist Policy and may require the artist to provide payout details.',
  },
  {
    title: '7. Payments and DPO',
    body: 'Payments are processed through our payment provider (DPO Pay). When you complete a purchase you will be directed to the provider\'s secure hosted checkout. We do not store your card details. Payment is authorised by the provider and confirmed back to us before an order is completed. Failed, cancelled or disputed payments are handled in accordance with our Buyer Policy and the provider\'s terms.',
  },
  {
    title: '8. Cancellations, refunds and returns',
    body: 'Cancellation and refund availability depend on order status:',
    items: [
      ['Before payment is processed', 'Orders not yet paid can be abandoned without charge.'],
      ['After payment', 'Refunds may be available where a listing was misrepresented, the artwork was not delivered, or the buyer and seller agree. Refunds are initiated through the platform and are subject to verification.'],
      ['Delivery', 'Buyers must confirm delivery through the App. Delivered orders are released for payout to the artist.'],
      ['Returns', 'Physical artwork returns are only possible by mutual agreement or where required by law. Digital artwork is generally non-refundable once delivered.'],
    ],
    note: 'Detailed refund, shipping and returns rules are in our Marketplace Policies section below and are subject to review by the operator.',
  },
  {
    title: '9. Shipping and delivery',
    body: 'Delivery is between the buyer and the artist (and, where relevant, a courier). The App records the delivery method, address and phone provided at checkout and provides delivery-status updates. The platform is not a carrier; sellers are responsible for dispatch and buyers for accepting delivery. Delivery timelines, costs and liability are agreed between the buyer and seller.',
  },
  {
    title: '10. Ownership and intellectual property',
    body: 'Artists retain ownership and copyright in their artwork unless otherwise agreed in writing. By listing artwork, the artist grants the platform a limited licence to display the artwork and its images within the App for the purposes of operating the service. Buyers acquire the physical artwork (or licence to digital content where applicable) as described in the listing; copyright and moral rights remain with the artist unless expressly transferred. You may not copy, reproduce or redistribute artwork images without the owner\'s permission.',
  },
  {
    title: '11. Prohibited content and conduct',
    body: 'You may not upload or use the App for:',
    items: [
      ['Illegal or fraudulent activity', 'Including counterfeit, stolen or infringing works, and fraudulent listings.'],
      ['Misrepresentation', 'Falsely claiming authorship, ownership, provenance or verification status.'],
      ['Harmful content', 'Content that is abusive, harassing, defamatory, hateful or otherwise objectionable.'],
      ['Infringement', 'Material that infringes any third party\'s copyright, trademark, privacy or other rights.'],
      ['Security abuse', 'Attempting to breach, disrupt or decompile the App, or to access another user\'s data.'],
      ['Evasion of fees', 'Taking transactions off-platform to avoid the service charge.'],
    ],
  },
  {
    title: '12. Moderation, reporting and disputes',
    body: 'We may review, hide or remove content that violates these Terms. Users may report concerns through the platform\'s moderation and support tools and may submit grievances through the App. We will attempt to facilitate resolution between buyers and sellers. Where a dispute cannot be resolved, it will be handled in accordance with our Dispute process and applicable law.',
  },
  {
    title: '13. Platform role and limitations of liability',
    body: `The App is a marketplace and venue; it is not a party to the sale of artwork. Except as expressly set out in these Terms, the platform provides the venue and technology, records transactions, provides payments and payout records, and applies a fixed service charge. To the maximum extent permitted by law, our aggregate liability in connection with the App is limited, and we are not liable for indirect, incidental or consequential damages. Where required by law, consumers retain their statutory rights under the laws governing your jurisdiction (${JURISDICTION} placeholder).`,
  },
  {
    title: '14. Termination and account suspension',
    body: 'You may stop using the App at any time and may delete your account through the profile account settings (see our Account Deletion page). We may suspend or terminate your access if you violate these Terms, applicable law or any policy. On termination, rights granted under these Terms end, but provisions that by their nature survive (including IP, liability and governing law) remain.',
  },
  {
    title: '15. Acceptable use and communications',
    body: 'You agree to use the App lawfully, not to harass or spam other users, not to send unsolicited messages, and to keep your contact and profile information accurate. We may send you transactional emails (order confirmations, verification results, password resets) and, where you opt in, notifications.',
  },
  {
    title: '16. Governing law and jurisdiction',
    body: `These Terms are governed by the laws of ${JURISDICTION} (placeholder), and the courts of Zambia shall have exclusive jurisdiction (to the extent applicable law permits). This provision is a placeholder and must be reviewed and confirmed by the operator and legal adviser before release.`,
  },
  {
    title: '17. Changes to these Terms',
    body: 'We may update these Terms from time to time. We will post revised Terms in the App and, where required, notify you. Continued use of the App after the changes take effect means you accept the updated Terms.',
  },
  {
    title: '18. Contact',
    body: `Questions about these Terms can be sent to: ${CONTACT_EMAIL}.`,
  },
];

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground font-body mb-2">
          <Link to="/" className="text-primary hover:underline">Home</Link> / Terms &amp; Conditions
        </p>
        <h1 className="font-playfair text-3xl font-bold">Terms &amp; Conditions</h1>
        <p className="text-muted-foreground font-body text-sm mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
      <div className="space-y-8">
        {Sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-semibold mb-2">{section.title}</h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">{section.body}</p>
            {section.items && (
              <ul className="mt-3 space-y-2">
                {section.items.map(([left, right]) => (
                  <li key={left} className="text-muted-foreground font-body text-sm leading-relaxed">
                    <span className="text-foreground font-medium">{left}:</span> {right}
                  </li>
                ))}
              </ul>
            )}
            {section.note && (
              <p className="mt-3 text-xs text-muted-foreground/80 font-body border-l-2 border-border pl-3">{section.note}</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}