import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Kalkidan CMS',
  description: 'Privacy policy and data protection information for Kalkidan CMS users',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-xl font-medium">Personal Information</h3>
              <p>
                When you create an account, we collect:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name and email address (required)</li>
                <li>Phone number and address (optional)</li>
                <li>Password (encrypted and stored securely)</li>
              </ul>

              <h3 className="text-xl font-medium">Usage Data</h3>
              <p>
                We automatically collect information about how you use our service:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Login times and session duration</li>
                <li>File upload and download activities</li>
                <li>IP addresses and browser information</li>
                <li>Pages visited and features used</li>
              </ul>

              <h3 className="text-xl font-medium">Files and Content</h3>
              <p>
                We store files you upload to our service, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>File names, types, and sizes</li>
                <li>Upload timestamps and metadata</li>
                <li>File content (encrypted at rest)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain our service</li>
                <li>Authenticate your identity and manage your account</li>
                <li>Store and manage your files securely</li>
                <li>Communicate with you about service updates</li>
                <li>Improve our service through usage analytics</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Sharing and Disclosure</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                We do not sell, trade, or rent your personal information to third parties. 
                We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>With your consent:</strong> When you explicitly agree to share information</li>
                <li><strong>Service providers:</strong> With trusted partners who help us operate our service</li>
                <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and session management</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and user permission systems</li>
                <li>Secure file storage with backup systems</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights and Choices</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Under GDPR and other privacy laws, you have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
                <li><strong>Objection:</strong> Object to certain types of data processing</li>
              </ul>
              
              <p>
                You can exercise these rights through your account privacy settings or by contacting us.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                We retain your data for as long as necessary to provide our service:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account data: Until you delete your account</li>
                <li>Files: Until you delete them or your account</li>
                <li>Usage logs: Up to 2 years for security and analytics</li>
                <li>Deleted data: Permanently removed within 30 days</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibent text-gray-900 mb-4">7. Cookies and Tracking</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keep you logged in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze usage patterns and improve our service</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p>
                You can control cookie settings through your browser preferences.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Our service is not intended for children under 13 years of age. 
                We do not knowingly collect personal information from children under 13. 
                If you are a parent or guardian and believe your child has provided us with personal information, 
                please contact us to have it removed.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Your data may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Posting the new policy on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending you an email notification for significant changes</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                If you have any questions about this privacy policy or our data practices, please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> privacy@kalkidan-cms.com</li>
                <li><strong>Address:</strong> [Your Company Address]</li>
                <li><strong>Phone:</strong> [Your Phone Number]</li>
              </ul>
            </div>
          </section>

          <div className="bg-gray-50 p-6 rounded-lg mt-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Protection Officer</h3>
            <p className="text-gray-700">
              For EU residents, you can contact our Data Protection Officer at: dpo@kalkidan-cms.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}