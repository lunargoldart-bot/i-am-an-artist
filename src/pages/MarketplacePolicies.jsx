import { Link } from 'react-router-dom';

// Placeholder values that must be finalised by the business owner / legal adviser.
const CONTACT_EMAIL = 'seantinashenyakutira@gmail.com';

const Policies = [
  {
    key: 'buyer',
    title: 'Buyer Policy',
    body: 'Collectors and buyers can browse listings, contact artists, add artwork to their cart and check out using our secure payment provider (DPO Pay). Buyers pay the artwork price displayed at checkout; a fixed platform service charge is borne by the seller. Before purchase, review the listing (images, description, price and category). After payment, delivery is arranged between the buyer and the artist as described in the order. Buyers are responsible for providing a correct delivery address and phone number. Buyers must confirm delivery through the App once they receive their artwork so the artist payout can be released.',
  },
  {
    key: 'seller',
    title: 'Seller / Artist Policy',
    body: 'Artists can list original artwork with accurate descriptions, images and a price in Zambian Kwacha. Artists must own or control the rights to everything they list and must not list counterfeits, reproductions presented as originals, or infringing content. On an approved sale, the artist earns the sale price less the fixed platform service charge (seller-paid), recorded as a pending payout, released after delivery confirmation or the release period. Artists are responsible for dispatching the artwork and shipping it safely using the delivery method recorded on the order. Verification is available and, when approved, marks the artist as verified.',
  },
  {
    key: 'service-charge',
    title: 'Service Charge Policy',
    body: 'The platform charges a fixed (non-percentage) service charge per artwork piece on sales, deducted from the artist payout. It is never computed as a percentage of the sale price. The current approved schedule is: K1–K250 = K2; K251–K1,000 = K5; K1,001–K2,500 = K10; K2,501–K5,000 = K20; K5,001–K10,000 = K40; K10,001+ = K75. Buyers pay only the artwork price. The schedule is configurable by the operator and the active schedule is applied server-side to new sales; historical transactions are not rewritten.',
  },
  {
    key: 'refund',
    title: 'Refund Policy',
    body: 'Refunds are considered where: the artwork delivered does not match the listing (materially misdescribed); the artwork is not delivered within a reasonable period; or the buyer and seller mutually agree to cancel. Refund requests should be raised through the App (orders / grievance) or by contacting support. Refunds are processed after verification. Digital artwork, once delivered, is generally non-refundable. Any refund must comply with applicable Zambian consumer law and platform verification.',
  },
  {
    key: 'shipping',
    title: 'Shipping Policy',
    body: 'Shipping is arranged between the buyer and the artist (a courier may be involved). The shipping method, address and phone are recorded at checkout, and delivery status is tracked in the App. The platform is not a carrier. Artists must dispatch artwork promptly and using reasonable care; buyers must accept delivery and confirm receipt. Delivery fees are agreed between buyer and seller unless the listing states shipping is included.',
  },
  {
    key: 'cancellation',
    title: 'Cancellation Policy',
    body: 'Before payment is processed, an order can be abandoned without charge. After payment, cancellation is only possible where the seller has not yet dispatched and the buyer requests cancellation, or by agreement, or where a refund claim is approved. Cancelled orders reverse the sale record and release the artwork back to available status.',
  },
  {
    key: 'returns',
    title: 'Returns Policy',
    body: 'Physical artwork may be returned only by mutual agreement between buyer and seller or where required by law (e.g. damaged in transit, materially misdescribed). Return shipping is the responsibility of the buyer unless otherwise agreed. Artwork must be returned in its original condition. Digital content delivered via the platform is not returnable.',
  },
  {
    key: 'ip',
    title: 'Intellectual Property / Copyright Policy',
    body: 'Artists retain copyright in their work. Listings grant the platform a limited licence to display the artwork within the App. Users may not copy, reproduce, modify or commercially exploit artwork images without the rights holder\'s permission. We respond to notices of alleged infringement and may remove infringing listings. If you believe your copyright is infringed, contact support with the relevant details.',
  },
  {
    key: 'moderation',
    title: 'Content Moderation Policy',
    body: 'All user content is subject to review. We may hide or remove content that is fraudulent, infringing, abusive, illegal or otherwise violates these Terms. Recurring or serious violations may lead to account suspension. Users can report problematic content through platform support and can submit grievances through the App.',
  },
  {
    key: 'prohibited',
    title: 'Prohibited Items Policy',
    body: 'The marketplace does not allow listings for: illegal goods; counterfeit items; items infringing third-party rights; items the seller does not own or have the right to sell; or any content that is hateful, abusive, or otherwise unlawful. Off-platform transactions intended to evade the service charge are also prohibited. Such listings may be removed without notice.',
  },
  {
    key: 'disputes',
    title: 'Dispute Process',
    body: 'If an order is disputed, buyers can raise a grievance through the App. The platform reviews order, payment, delivery and communication records and facilitates a resolution between the buyer and seller. Where a resolution cannot be reached, the matter proceeds in accordance with the governing law and jurisdiction set out in the Terms & Conditions.',
  },
];

export default function MarketplacePolicies() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground font-body mb-2">
          <Link to="/" className="text-primary hover:underline">Home</Link> / Marketplace Policies
        </p>
        <h1 className="font-playfair text-3xl font-bold">Marketplace Policies</h1>
        <p className="text-muted-foreground font-body text-sm mt-2">
          These policies describe how buying, selling, fees, delivery, refunds and disputes work on I Am An Artist. They are part of and complement our Terms &amp; Conditions and Privacy Policy.
        </p>
      </div>
      <div className="space-y-8">
        {Policies.map((policy) => (
          <section key={policy.key}>
            <h2 className="font-display text-xl font-semibold mb-2">{policy.title}</h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">{policy.body}</p>
          </section>
        ))}
      </div>
      <div className="mt-10 p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground font-body">
        Questions? Contact support at <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>, or read the <Link to="/terms" className="text-primary hover:underline">Terms &amp; Conditions</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
      </div>
    </div>
  );
}