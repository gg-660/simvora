import Head from 'next/head';
import Navbar from '@/components/Navbar';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Simvora</title>
      </Head>
      <Navbar />
      <main className="bg-black text-gray-300 min-h-screen p-10 pt-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold text-white mb-6 text-center">Privacy Policy</h1>

          {[
            {
              title: "Overview",
              content:
                "Simvora (“we”, “our”, or “us”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.",
            },
            {
              title: "Information We Collect",
              content:
                "We may collect personal information such as your name, email address, and usage data when you use our site, create an account, or interact with our services.",
            },
            {
              title: "How We Use Your Information",
              content:
                "We use your information to provide and improve our services, personalize your experience, communicate with you, and ensure site security.",
            },
            {
              title: "Sharing Your Information",
              content:
                "We do not sell your personal information. We may share your data with service providers strictly for purposes related to operating and maintaining the website.",
            },
            {
              title: "Cookies and Tracking",
              content:
                "We may use cookies and similar technologies to collect usage data and enhance functionality. You can adjust your browser settings to decline cookies.",
            },
            {
              title: "Data Security",
              content:
                "We implement security measures to protect your information, but no method of transmission over the internet is 100% secure.",
            },
            {
              title: "Your Rights",
              content:
                "You may request access to, correction of, or deletion of your personal data by contacting us at hello@simvora.com.",
            },
            {
              title: "Changes to This Policy",
              content:
                "We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on our website.",
            },
            {
              title: "Need Help?",
              content:
                "This privacy policy does not cover every possible scenario. If you have any questions, do not hesitate to reach out to us at hello@simvora.com.",
            },
          ].map(({ title, content }) => (
            <div key={title} className="bg-[#2a2a2a] p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
              <p>{content}</p>
            </div>
          ))}

          <p className="text-sm text-gray-500 text-center pt-6">Last Updated: May 9, 2025</p>
        </div>
      </main>
    </>
  );
}