import { Metadata } from "next";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - V Arena",
  description: "V Arena Terms of Service - Read our terms and conditions for using our platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <Card className="bg-black/50 border-[#5865F2]/30">
            <CardHeader>
              <CardTitle className="text-white text-3xl mb-2">Terms of Service</CardTitle>
              <p className="text-gray-400 text-sm">
                Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-300">
              <div>
                <h2 className="text-white text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using V Arena ("the Service"), you accept and agree to be bound by these Terms of Service.
                  If you do not agree to these terms, please do not use our Service.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">2. Description of Service</h2>
                <p>
                  V Arena is a community platform for V Rising players that allows users to create, share, and discover builds.
                  The Service includes features such as:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Build creation and management tools</li>
                  <li>Public and private build sharing</li>
                  <li>Build voting and rating system</li>
                  <li>User accounts and profiles</li>
                  <li>Community features and updates</li>
                </ul>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">3. User Accounts</h2>
                <h3 className="text-white text-lg font-medium mt-4 mb-2">3.1 Account Creation</h3>
                <p>To use certain features, you must create an account. You agree to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information to keep it accurate</li>
                  <li>Maintain the security of your password</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>

                <h3 className="text-white text-lg font-medium mt-4 mb-2">3.2 Account Eligibility</h3>
                <p>You must be at least 16 years old to create an account. By creating an account, you represent that you meet this age requirement.</p>

                <h3 className="text-white text-lg font-medium mt-4 mb-2">3.3 Account Termination</h3>
                <p>
                  We reserve the right to suspend or terminate your account at any time for violations of these Terms,
                  illegal activity, or any other reason we deem necessary to protect the Service and its users.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">4. User Conduct</h2>
                <p>You agree not to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Use the Service for any illegal purpose or in violation of any laws</li>
                  <li>Post, upload, or share content that is harmful, abusive, defamatory, or offensive</li>
                  <li>Impersonate any person or entity or misrepresent your affiliation</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Attempt to gain unauthorized access to any part of the Service</li>
                  <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
                  <li>Violate any intellectual property rights</li>
                  <li>Spam, harass, or abuse other users</li>
                </ul>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">5. User Content</h2>
                <h3 className="text-white text-lg font-medium mt-4 mb-2">5.1 Your Content</h3>
                <p>
                  You retain ownership of any content you create, upload, or share on the Service ("User Content").
                  By posting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, display,
                  and distribute your content on the Service.
                </p>

                <h3 className="text-white text-lg font-medium mt-4 mb-2">5.2 Content Standards</h3>
                <p>Your User Content must:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Be original or you must have the right to share it</li>
                  <li>Not infringe on any third-party rights</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not contain malicious code or viruses</li>
                </ul>

                <h3 className="text-white text-lg font-medium mt-4 mb-2">5.3 Content Removal</h3>
                <p>
                  We reserve the right to remove any User Content that violates these Terms or that we determine is harmful,
                  inappropriate, or violates the rights of others.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">6. Intellectual Property</h2>
                <p>
                  The Service, including its design, features, and functionality, is owned by V Arena and protected by copyright,
                  trademark, and other intellectual property laws. You may not copy, modify, or create derivative works without our written permission.
                </p>
                <p className="mt-2">
                  V Rising is a trademark of Stunlock Studios. V Arena is not affiliated with Stunlock Studios.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">7. Privacy</h2>
                <p>
                  Your use of the Service is also governed by our{" "}
                  <Link href="/privacy-policy" className="text-[#5865F2] hover:underline">
                    Privacy Policy
                  </Link>
                  . Please review it to understand how we collect, use, and protect your information.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">8. Service Availability</h2>
                <p>
                  We strive to provide reliable service but do not guarantee that the Service will be available at all times.
                  We may experience downtime for maintenance, updates, or unforeseen circumstances. We are not liable for any
                  loss or damage resulting from Service unavailability.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">9. Disclaimers</h2>
                <p>
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                  WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                  AND NON-INFRINGEMENT.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">10. Limitation of Liability</h2>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, V ARENA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                  CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY,
                  OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">11. Indemnification</h2>
                <p>
                  You agree to indemnify and hold harmless V Arena, its officers, directors, employees, and agents from any claims,
                  damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service,
                  violation of these Terms, or infringement of any rights of another.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">12. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of material changes by posting
                  the updated Terms on this page and updating the "Last updated" date. Your continued use of the Service after
                  changes constitutes acceptance of the new Terms.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">13. Governing Law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the European Union,
                  without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service
                  shall be subject to the exclusive jurisdiction of the courts of the European Union.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">14. Severability</h2>
                <p>
                  If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or
                  eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">15. Contact Information</h2>
                <p>
                  If you have questions about these Terms, please contact us:
                </p>
                <ul className="list-none mt-2 space-y-1 ml-4">
                  <li>• Through our Discord server: <Link href="https://discord.gg/varena" target="_blank" className="text-[#5865F2] hover:underline">discord.gg/varena</Link></li>
                </ul>
              </div>

              <div className="pt-6 border-t border-[#5865F2]/30">
                <p className="text-sm text-gray-400">
                  By using V Arena, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

