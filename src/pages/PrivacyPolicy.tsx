
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: July 1, 2024
          </p>
        </div>

        <Card className="glass-effect glow-border">
          <CardContent className="p-8 prose prose-invert max-w-none">
            <h2>Introduction</h2>
            <p>
              GeoLearn ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              online learning platform.
            </p>

            <h2>Information We Collect</h2>
            <h3>Personal Information</h3>
            <ul>
              <li>Name and contact information (email address, phone number)</li>
              <li>Account credentials (username, password)</li>
              <li>Profile information (educational background, interests)</li>
              <li>Payment information (processed securely through third-party providers)</li>
            </ul>

            <h3>Usage Information</h3>
            <ul>
              <li>Course progress and completion data</li>
              <li>Quiz and assessment results</li>
              <li>Discussion forum posts and comments</li>
              <li>Platform usage analytics and preferences</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul>
              <li>Provide and maintain our educational services</li>
              <li>Track your learning progress and achievements</li>
              <li>Communicate with you about courses and updates</li>
              <li>Improve our platform and course content</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>

            <h2>Information Sharing</h2>
            <p>We do not sell or rent your personal information to third parties. We may share information:</p>
            <ul>
              <li>With instructors for educational purposes</li>
              <li>With service providers who assist in platform operations</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer or merger</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
              <li>Request data portability</li>
            </ul>

            <h2>Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage, 
              and provide personalized content. You can control cookie settings through your browser.
            </p>

            <h2>Children's Privacy</h2>
            <p>
              Our platform is not intended for children under 13. We do not knowingly collect 
              personal information from children under 13 years of age.
            </p>

            <h2>International Users</h2>
            <p>
              Your information may be processed in countries other than your own. We ensure 
              appropriate safeguards are in place for international data transfers.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              material changes by posting the new policy on our platform.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <ul>
              <li>Email: privacy@geolearn.com</li>
              <li>Address: Global Online Platform</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
