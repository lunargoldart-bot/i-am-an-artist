import { Link } from 'react-router-dom';

// Placeholder values that must be finalised by the business owner / legal adviser.
// Flagged in IAA_FINAL_PRE_RELEASE_AUDIT.md as BLUE (client/legal decision required).
const CONTACT_EMAIL = 'seantinashenyakutira@gmail.com'; // support email used in platform settings
const OPERATOR = 'I Am An Artist (the platform operator)'; // TODO: confirm legal entity name & registration
const JURISDICTION = 'Zambia'; // TODO: confirm governing jurisdiction for data protection

const Sections = [
  {
    title: '1. Who we are',
    body: `${OPERATOR} operates the I Am An Artist application (the "App"), an online marketplace that connects artists and collectors, and provides galleries, exhibitions, creative communities, messaging and related commerce services. The App is available on the web (PWA), Android (Capacitor) and iOS (Capacitor).`,
  },
  {
    title: '2. Information we collect',
    body: 'We collect information you provide directly, information we generate when you use the App, and information from authentication providers and payment processors you choose to use.',
    items: [
      ['Account and profile data', 'Your name, email address, profile image, bio, location, phone number, artist categories, social links and artist statement when you create or update your account or artist profile.'],
      ['Authentication data', 'Firebase Authentication accounts (email/password or Google Sign-In). With Google Sign-In we receive the Google account name, email and profile photo scopes you authorise. Passwords are never stored by us; they are handled and stored securely by Firebase Authentication.'],
      ['Artwork and uploaded images', 'Artwork titles, descriptions, images, prices, categories and related listing data you upload, plus verification documents you submit (identity documents, NRC and phone number) for artist verification. Uploads are stored in Firebase Storage.'],
      ['Marketplace and commerce data', 'Orders, cart contents, delivery details (address, phone, notes), listings, bids, purchases, payment records, transactions and payout records.'],
      ['Messaging', 'Messages you exchange with other users (text and optional offer amounts), and message read state.'],
      ['Collections, wishlist and preferences', 'Items you add to collections, your wishlist and buyer-preference records used to personalise discovery.'],
      ['Interactions and activity', 'Views, browsing activity, reloaded content, sponsored-ad impressions/clicks, reviews, grievances, collaboration requests, badge/progress records and notifications.'],
      ['Device and technical data', 'The Firebase Web SDK, our hosting and analytics may process IP address, browser/device type, operating system, screen information and usage telemetry required to deliver, secure and improve the App. We do not collect precise location data; location fields are optional text you provide.'],
    ],
  },
  {
    title: '3. Why we collect and use your information',
    body: 'We use the information above to:',
    items: [
      ['Provide and operate the App', 'Authenticate you, display and manage your profile, art, listings, orders and messages.'],
      ['Facilitate sales', 'Process purchases through our payment provider, create order, payment, transaction and payout records, and calculate the fixed platform service charge.'],
      ['Verify artists', 'Review submitted identity/document information to decide artist verification status.'],
      ['Communicate with you', 'Send service emails (sale notifications, verification results, password-reset emails and administrative notices).'],
      ['Improve the product', 'Analyse aggregate usage to refine discovery, galleries and marketplace features.'],
      ['Keep the App safe', 'Prevent fraud, enforce our Terms, resolve disputes and comply with legal obligations.'],
    ],
  },
  {
    title: '4. Third parties and service providers',
    body: 'We share information only as needed to run the App, with the following categories of providers:',
    items: [
      ['Firebase (Google)', 'Authentication, Firestore database, Cloud Functions, Cloud Storage and Hosting. Your app data is stored in Google Cloud infrastructure.'],
      ['DPO Pay (3G Direct Pay)', 'Payment processing for checkout. When you make a purchase, we send your name, email, phone, address and the transaction amount to DPO to create a hosted payment session. DPO processes the payment and returns a confirmation.' ,],
      ['SendGrid (Twilio)', 'Transactional email delivery (sale alerts, verification notifications and reports).'],
      ['OpenAI', 'Optional AI-assisted price suggestions and advisor responses. Only the prompt text you submit is sent; we do not send your personal data unless included by you.'],
    ],
  },
  {
    title: '5. How we store and protect your information',
    body: 'Data is stored in Firebase (Google Cloud) datastores. Access to user data is controlled by Firestore security rules and by server-side Cloud Functions checks that enforce ownership (e.g. only you see your messages; only you or an administrator can see your verification data). We follow industry-standard security practices, including server-side authorisation checks, rate limiting on sensitive functions and restricted storage rules for uploads. We do not sell your personal information.',
  },
  {
    title: '6. Data retention',
    body: 'We retain information for as long as needed to provide the App and to meet legal, accounting and tax obligations:',
    items: [
      ['Account and profile data', 'Retained while your account is active and removed when you delete your account.'],
      ['Transactional records (orders, payments, transactions, payouts)', 'Retained for business, accounting and tax purposes and retained/anonymised when an account is deleted. These records are not deleted so that we can comply with record-keeping obligations and resolve disputes.'],
      ['Payment logs and audit logs', 'Retained for security and reconciliation purposes.'],
      ['Messages and user content', 'Retained while your account is active and deleted as part of account deletion.'],
    ],
  },
  {
    title: '7. Deleting your data (account deletion)',
    body: 'You can delete your account at any time from the App under your profile account settings, or by requesting deletion through our public deletion page. On deletion we:',
    items: [
      ['Delete', 'Your profile document, wishlists, preferences, messages, verification submissions, progress, notifications and other user-generated content you own.'],
      ['Retain (anonymised)', 'Transactional records connected to your sales or purchases are kept but your name and email are replaced with a "deleted user" placeholder so the financial history remains accurate without exposing your identity.'],
      ['Delete the authentication record', 'Your Firebase Authentication account is removed so you can no longer sign in.'],
    ],
  },
  {
    title: '8. Your rights',
    body: 'Subject to applicable law in the jurisdiction in which the App operates (${JURISDICTION} placeholder — to be confirmed by the operator), you may have the right to access, correct, or request deletion of your personal information, to object to or restrict certain processing, and to withdraw consent where processing is based on consent. You can exercise most rights through the App (for example, editing your profile or deleting your account). For any other request, contact us using the details below.',
  },
  {
    title: '9. Children',
    body: 'The App is not directed at children under the minimum age set by applicable law, and we do not knowingly collect personal information from children. If we learn that a child has provided us personal information, we will delete it.',
  },
  {
    title: '10. Changes to this policy',
    body: `We may update this Privacy Policy from time to time. We will post revised versions in the App and, where required, notify you. Continued use of the App after changes takes effect means you accept the updated policy. Effective date: ${new Date().toUTCString().split(' ').slice(0, 4).join(' ')} (placeholders pending legal review).`,
  },
  {
    title: '11. Contact',
    body: `For privacy questions or requests, contact us at: ${CONTACT_EMAIL}. The App's support email is shown in the platform settings and used for support and privacy contact.`,
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground font-body mb-2"><Link to="/" className="text-primary hover:underline">Home</Link> / Privacy Policy</p>
        <h1 className="font-playfair text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground font-body text-sm mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
      <div className="space-y-8">
        {Sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-semibold mb-2">{section.title}</h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">{section.body}</p>
            {section.items && (
              <ul className="mt-3 space-y-2">
                {section.items.map(([label, text]) => (
                  <li key={label} className="text-muted-foreground font-body text-sm leading-relaxed">
                    <span className="text-foreground font-medium">{label}:</span> {text}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}