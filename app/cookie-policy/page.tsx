import { Metadata } from "next";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy - V Arena",
  description: "V Arena Cookie Policy - Learn about how we use cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <Card className="bg-black/50 border-[#5865F2]/30">
            <CardHeader>
              <CardTitle className="text-white text-3xl mb-2">Cookie Policy</CardTitle>
              <p className="text-gray-400 text-sm">
                Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-300">
              <div>
                <h2 className="text-white text-xl font-semibold mb-3">1. What Are Cookies?</h2>
                <p>
                  Cookies are small text files that are placed on your device when you visit a website. They are widely used to make
                  websites work more efficiently and provide information to website owners.
                </p>
                <p className="mt-2">
                  This Cookie Policy explains how V Arena ("we," "our," or "us") uses cookies and similar technologies on our website.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">2. How We Use Cookies</h2>
                <p>We use cookies for the following purposes:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li><strong>Essential Functionality:</strong> To enable core features like user authentication and session management</li>
                  <li><strong>Preferences:</strong> To remember your settings and preferences (e.g., sidebar state, theme)</li>
                  <li><strong>Analytics:</strong> To understand how visitors use our website and improve our services (with your consent)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">3. Types of Cookies We Use</h2>

                <h3 className="text-white text-lg font-medium mt-4 mb-2">3.1 Necessary Cookies</h3>
                <p>
                  These cookies are essential for the website to function properly. They cannot be disabled and are set in response to
                  actions you take, such as logging in or setting privacy preferences.
                </p>
                <div className="mt-3 p-3 bg-[#0f0a47]/30 rounded-lg border border-[#5865F2]/20">
                  <p className="text-sm">
                    <strong>Examples:</strong>
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm ml-4">
                    <li>Session cookies for authentication</li>
                    <li>Security cookies to prevent fraud</li>
                    <li>Cookie consent preferences</li>
                  </ul>
                </div>

                <h3 className="text-white text-lg font-medium mt-4 mb-2">3.2 Analytics Cookies</h3>
                <p>
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                  We use Vercel Analytics for this purpose. These cookies require your consent.
                </p>
                <div className="mt-3 p-3 bg-[#0f0a47]/30 rounded-lg border border-[#5865F2]/20">
                  <p className="text-sm">
                    <strong>Examples:</strong>
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm ml-4">
                    <li>Page views and navigation patterns</li>
                    <li>Time spent on pages</li>
                    <li>Error tracking and performance metrics</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">4. Third-Party Cookies</h2>
                <p>We may use third-party services that set their own cookies:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li><strong>Vercel Analytics:</strong> For website analytics (requires consent)</li>
                  <li><strong>Google Fonts:</strong> For loading web fonts (may set cookies)</li>
                </ul>
                <p className="mt-2">
                  These third parties have their own privacy policies and cookie practices. We encourage you to review them.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">5. Cookie Duration</h2>
                <h3 className="text-white text-lg font-medium mt-4 mb-2">5.1 Session Cookies</h3>
                <p>
                  These cookies are temporary and are deleted when you close your browser. They are used to maintain your session
                  while you navigate the website.
                </p>

                <h3 className="text-white text-lg font-medium mt-4 mb-2">5.2 Persistent Cookies</h3>
                <p>
                  These cookies remain on your device for a set period or until you delete them. They remember your preferences
                  and settings for future visits.
                </p>
                <div className="mt-3 p-3 bg-[#0f0a47]/30 rounded-lg border border-[#5865F2]/20">
                  <p className="text-sm">
                    <strong>Examples:</strong>
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm ml-4">
                    <li>Cookie consent preferences: Stored until you change them</li>
                    <li>Sidebar state: 7 days</li>
                    <li>Authentication tokens: As needed for security</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">6. Managing Cookies</h2>
                <h3 className="text-white text-lg font-medium mt-4 mb-2">6.1 Cookie Consent Banner</h3>
                <p>
                  When you first visit our website, you will see a cookie consent banner. You can:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Accept all cookies</li>
                  <li>Reject non-essential cookies</li>
                  <li>Customize your cookie preferences</li>
                </ul>

                <h3 className="text-white text-lg font-medium mt-4 mb-2">6.2 Browser Settings</h3>
                <p>
                  You can also manage cookies through your browser settings. Most browsers allow you to:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>View and delete cookies</li>
                  <li>Block cookies from specific sites</li>
                  <li>Block all cookies</li>
                  <li>Delete all cookies when you close your browser</li>
                </ul>
                <p className="mt-2 text-sm text-gray-400">
                  <strong>Note:</strong> Blocking necessary cookies may affect the functionality of our website.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">7. Your Rights</h2>
                <p>
                  Under GDPR, you have the right to:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Be informed about cookie usage (this policy)</li>
                  <li>Give or withdraw consent for non-essential cookies</li>
                  <li>Access information about cookies we use</li>
                  <li>Request deletion of cookie data</li>
                </ul>
                <p className="mt-2">
                  You can manage your cookie preferences at any time through the cookie consent banner or by contacting us.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">8. Updates to This Policy</h2>
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for legal,
                  operational, or regulatory reasons. We will notify you of any material changes by updating the "Last updated" date.
                </p>
              </div>

              <div>
                <h2 className="text-white text-xl font-semibold mb-3">9. More Information</h2>
                <p>
                  For more information about how we handle your personal data, please see our{" "}
                  <Link href="/privacy-policy" className="text-[#5865F2] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
                <p className="mt-2">
                  If you have questions about our use of cookies, please contact us through our Discord server:{" "}
                  <Link href="https://discord.gg/varena" target="_blank" className="text-[#5865F2] hover:underline">
                    discord.gg/varena
                  </Link>
                </p>
              </div>

              <div className="pt-6 border-t border-[#5865F2]/30">
                <p className="text-sm text-gray-400">
                  This Cookie Policy is effective as of the date listed above and applies to all users of V Arena.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

