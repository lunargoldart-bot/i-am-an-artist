import { Link } from 'react-router-dom';
import { ShieldAlert, Mail, LogIn, Trash2 } from 'lucide-react';

// Support email used in platform settings.
const CONTACT_EMAIL = 'seantinashenyakutira@gmail.com';

export default function DeleteAccount() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground font-body mb-2">
          <Link to="/" className="text-primary hover:underline">Home</Link> / Account Deletion
        </p>
        <h1 className="font-playfair text-3xl font-bold">Deleting your I Am An Artist account</h1>
        <p className="text-muted-foreground font-body text-sm mt-2">
          This page explains how to permanently delete your I Am An Artist account and what happens to your data.
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-primary" /> How to delete your account
          </h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            You can delete your account yourself, using the in-app control:
          </p>
          <ol className="mt-3 list-decimal list-inside space-y-2 text-muted-foreground font-body text-sm leading-relaxed">
            <li>Sign in to I Am An Artist.</li>
            <li>Open your Profile (My Profile / Account Settings).</li>
            <li>Choose <strong className="text-foreground">Delete Account</strong>, read the explanation and confirm.</li>
            <li>Your account and profile data are removed and you are signed out immediately.</li>
          </ol>
          <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
            <LogIn className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground font-body">
              <p className="font-medium text-foreground">Need to sign in first?</p>
              <p>If you cannot remember your password, use the <Link to="/login" className="text-primary hover:underline">sign-in page</Link> and choose "Forgot password?" to reset it before deleting your account.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" /> What happens to your data
          </h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            When you delete your account we:
          </p>
          <ul className="mt-3 list-disc list-inside space-y-2 text-muted-foreground font-body text-sm leading-relaxed">
            <li>Delete your profile and account record.</li>
            <li>Delete user-generated content you own, including wishlists, preferences, messages, verification submissions, progress and notifications.</li>
            <li>Permanently remove your Firebase Authentication login so you can no longer sign in.</li>
            <li>Log you out.</li>
          </ul>
          <p className="mt-4 text-muted-foreground font-body text-sm leading-relaxed">
            <strong className="text-foreground">Retention:</strong> certain records are kept for legitimate business, accounting and tax reasons and to resolve disputes. These are sales, payment, transaction and payout records connected to your activity. When you delete your account, your name and email within those records are replaced with a "deleted user" placeholder so the financial history remains accurate without exposing your identity. They are retained in accordance with applicable law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" /> Request deletion by contact
          </h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            If you cannot sign in or want to request deletion another way, contact our support team at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>{' '}
            with the email address registered on your account. We will verify your request before deleting your data.
          </p>
          <p className="mt-3 text-xs text-muted-foreground/80 font-body">
            Note: we verify ownership of the account before processing deletion requests. Deletion is permanent and cannot be undone.
          </p>
        </section>
      </div>
    </div>
  );
}