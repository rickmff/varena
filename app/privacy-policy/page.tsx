import { Metadata } from "next";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - V Arena",
  description: "V Arena Privacy Policy - Learn how we collect, use, and protect your personal data in accordance with GDPR.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <Card className="bg-black/50 border-[#5865F2]/30">
            <CardHeader>
              <CardTitle className="text-white text-3xl mb-2">Privacy Policy</CardTitle>
              <p className="text-gray-400 text-sm">
                Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-300">
              <div>
                <h2 className="text-white text-xl font-semibold mb-3">1. Introduction</h2>
                <p>
                  Welcome to V Arena ("we," "our," or "us"). We are committed to protecting your personal data and respecting your privacy.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                </p>
                <p className="mt-2">
                  This policy complies with the General Data Protection Regulation (GDPR) (EU) 2016/679 and other applicable data protection laws.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">2. Data Controller</h2>
                <p>
                  V Arena is the data controller responsible for your personal data. If you have any questions about this Privacy Policy or our data practices,
                  please contact us through our website or Discord server.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">3. Information We Collect</h2>
                <h3 className="text-white text-lg font-medium mt-4 mb-2">3.1 Personal Information</h3>
                <p>When you create an account, we collect:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Email address (required)</li>
                  <li>Name (optional)</li>
                  <li>Profile image (optional)</li>
                  <li>Password (encrypted and hashed)</li>
                </ul>

                <h3 className="text-white text-lg font-medium mt-4 mb-2">3.2 Usage Data</h3>
                <p>We automatically collect information about how you use our service:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Builds you create and save</li>
                  <li>Votes you cast on builds</li>
                  <li>Session information and login history</li>
                  <li>Account creation and last update timestamps</li>
                </ul>

                <h3 className="text-white text-lg font-medium mt-4 mb-2">3.3 Cookies and Tracking</h3>
                <p>
                  We use cookies and similar technologies. For detailed information, please see our{" "}
                  <Link href="/cookie-policy" className="text-[#5865F2] hover:underline">
                    Cookie Policy
                  </Link>
                  .
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">4. How We Use Your Information</h2>
                <p>We use your personal data for the following purposes:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li><strong>Account Management:</strong> To create and manage your account, authenticate you, and provide access to our services</li>
                  <li><strong>Service Delivery:</strong> To allow you to create, save, and share builds</li>
                  <li><strong>Communication:</strong> To send you verification emails, password reset links, and important service updates</li>
                  <li><strong>Analytics:</strong> To understand how users interact with our website and improve our services (with your consent)</li>
                  <li><strong>Security:</strong> To protect against fraud, abuse, and security threats</li>
                  <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
                </ul>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">5. Legal Basis for Processing</h2>
                <p>Under GDPR, we process your personal data based on the following legal grounds:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li><strong>Consent:</strong> For analytics cookies and optional features</li>
                  <li><strong>Contract Performance:</strong> To provide you with our services as requested</li>
                  <li><strong>Legitimate Interests:</strong> For security, fraud prevention, and service improvement</li>
                  <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">6. Data Sharing and Disclosure</h2>
                <p>We do not sell your personal data. We may share your information only in the following circumstances:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li><strong>Service Providers:</strong> With trusted third-party services (e.g., Vercel for hosting, Resend for emails) that help us operate our service</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                  <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice to users)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">7. Data Retention</h2>
                <p>We retain your personal data for as long as necessary to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Provide you with our services</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce agreements</li>
                </ul>
                <p className="mt-2">
                  When you delete your account, we will delete or anonymize your personal data within 30 days,
                  except where we are required to retain it for legal purposes.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">8. Your Rights Under GDPR</h2>
                <p>As a data subject, you have the following rights:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li><strong>Right to Access:</strong> Request a copy of all personal data we hold about you</li>
                  <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                  <li><strong>Right to Restrict Processing:</strong> Request limitation of how we process your data</li>
                  <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                  <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                  <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
                </ul>
                <p className="mt-3">
                  You can exercise these rights by visiting your{" "}
                  <Link href="/profile" className="text-[#5865F2] hover:underline">
                    Profile page
                  </Link>
                  {" "}or contacting us directly.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">9. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal data against unauthorized access,
                  alteration, disclosure, or destruction. This includes:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Encryption of passwords using industry-standard hashing algorithms</li>
                  <li>Secure HTTPS connections for all data transmission</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication mechanisms</li>
                </ul>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">10. International Data Transfers</h2>
                <p>
                  Your data may be processed and stored outside the European Economic Area (EEA). When we transfer data outside the EEA,
                  we ensure appropriate safeguards are in place, such as Standard Contractual Clauses or adequacy decisions.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">11. Children's Privacy</h2>
                <p>
                  Our service is not intended for users under the age of 16. We do not knowingly collect personal data from children.
                  If you believe we have collected data from a child, please contact us immediately.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">12. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy
                  on this page and updating the "Last updated" date. Your continued use of our service after changes constitutes acceptance.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">13. Contact Us</h2>
                <p>
                  If you have questions, concerns, or wish to exercise your rights, please contact us:
                </p>
                <ul className="list-none mt-2 space-y-1 ml-4">
                  <li>• Through our Discord server: <Link href="https://discord.gg/varena" target="_blank" className="text-[#5865F2] hover:underline">discord.gg/varena</Link></li>
                  <li>• Via our website contact form (if available)</li>
                </ul>
              </div>

              <div className="pt-6 border-t border-[#5865F2]/30">
                <p className="text-sm text-gray-400">
                  This Privacy Policy is effective as of the date listed above and applies to all users of V Arena.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

