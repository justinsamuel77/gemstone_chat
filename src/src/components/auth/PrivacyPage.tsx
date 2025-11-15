import React from "react";

export const PrivacyPage = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-white py-10 px-6">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <p className="mb-4">
          <strong>Company Name:</strong> Madhavan Jewellery
        </p>

        <p className="mb-4">
          At Madhavan Jewellery, we value your trust and are committed to
          protecting your personal information. This Privacy Policy explains how
          we collect, use, and safeguard your data when you use our Customer
          Relationship Management (CRM) system and related services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Personal Information:</strong> Name, contact number, email address, billing and shipping details.</li>
          <li><strong>Purchase Data:</strong> Product details, transaction amount, date, and mode of payment.</li>
          <li><strong>Communication Data:</strong> Messages, feedback, or queries shared through the CRM or WhatsApp integration.</li>
          <li><strong>System Data:</strong> IP address, browser type, and device information for security and analytics.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Maintain customer profiles and manage jewellery orders.</li>
          <li>Send billing invoices, receipts, and promotional updates.</li>
          <li>Improve our CRM system and customer experience.</li>
          <li>Notify you about offers, services, or events.</li>
          <li>Ensure fraud prevention and data security.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Data Sharing and Disclosure</h2>
        <p className="mb-2">We do not sell or rent your personal information.</p>
        <p className="mb-4">We may share limited data only with:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Trusted service providers assisting in order management or marketing (confidentiality agreements applied).</li>
          <li>Legal authorities, if required by law.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Security</h2>
        <p className="mb-4">
          We use appropriate security measures to protect your personal data.
          However, no digital platform can guarantee absolute security.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Cookies and Tracking</h2>
        <p className="mb-4">
          Our CRM may use cookies to improve performance and remember preferences.
          You can manage cookies using your browser settings.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Your Rights</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Request access to your personal information.</li>
          <li>Update or correct your details.</li>
          <li>Withdraw consent for marketing communications.</li>
          <li>Request deletion of your data (subject to legal conditions).</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">7. Updates to This Policy</h2>
        <p className="mb-10">
          We may update this Privacy Policy occasionally. Changes will be reflected
          with a new “Effective Date.”
        </p>
      </div>
    </div>
  );
};
