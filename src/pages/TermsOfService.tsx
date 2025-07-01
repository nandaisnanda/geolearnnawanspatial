
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last updated: July 1, 2024
          </p>
        </div>

        <Card className="glass-effect glow-border">
          <CardContent className="p-8 prose prose-invert max-w-none">
            <h2>Agreement to Terms</h2>
            <p>
              By accessing and using GeoLearn ("the Platform"), you agree to be bound by these 
              Terms of Service and all applicable laws and regulations.
            </p>

            <h2>Description of Service</h2>
            <p>
              GeoLearn is an online learning platform that provides courses, tutorials, and 
              educational content related to Geographic Information Systems (GIS) and related technologies.
            </p>

            <h2>User Accounts</h2>
            <h3>Registration</h3>
            <ul>
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must be at least 13 years old to create an account</li>
            </ul>

            <h3>Account Responsibilities</h3>
            <ul>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized use</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
            </ul>

            <h2>Course Access and Usage</h2>
            <h3>License to Use</h3>
            <p>
              Upon enrollment and payment, you receive a limited, non-exclusive license to access 
              and use course materials for personal, non-commercial educational purposes.
            </p>

            <h3>Restrictions</h3>
            <p>You may not:</p>
            <ul>
              <li>Share your account credentials with others</li>
              <li>Download, copy, or distribute course materials without permission</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Use the platform for any illegal or unauthorized purpose</li>
            </ul>

            <h2>Payment and Refunds</h2>
            <h3>Course Fees</h3>
            <ul>
              <li>Course fees are clearly displayed before enrollment</li>
              <li>Payment is required before accessing premium content</li>
              <li>All fees are in USD unless otherwise specified</li>
            </ul>

            <h3>Refund Policy</h3>
            <ul>
              <li>Refunds may be requested within 30 days of purchase</li>
              <li>Refunds are subject to completion percentage and platform usage</li>
              <li>Some promotional offers may have different refund terms</li>
            </ul>

            <h2>User Content and Conduct</h2>
            <h3>Discussion Forums</h3>
            <p>
              You may post questions, comments, and participate in discussions. All content must be:
            </p>
            <ul>
              <li>Respectful and professional</li>
              <li>Relevant to the course or topic</li>
              <li>Free from harassment, spam, or inappropriate material</li>
              <li>Compliant with all applicable laws</li>
            </ul>

            <h3>Content Ownership</h3>
            <ul>
              <li>You retain ownership of content you create and post</li>
              <li>You grant us a license to use your content within the platform</li>
              <li>We own all course materials, software, and platform content</li>
            </ul>

            <h2>Intellectual Property</h2>
            <p>
              All course content, including videos, text, graphics, and software, is protected by 
              copyright and other intellectual property laws. Unauthorized use is prohibited.
            </p>

            <h2>Platform Availability</h2>
            <ul>
              <li>We strive to provide continuous access but cannot guarantee 100% uptime</li>
              <li>Scheduled maintenance will be announced in advance when possible</li>
              <li>We are not liable for temporary service interruptions</li>
            </ul>

            <h2>Privacy and Data Protection</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy to understand 
              how we collect, use, and protect your information.
            </p>

            <h2>Disclaimers and Limitations</h2>
            <h3>Educational Content</h3>
            <ul>
              <li>Course content is for educational purposes only</li>
              <li>We do not guarantee specific career outcomes or certifications</li>
              <li>Industry practices and software may evolve beyond course content</li>
            </ul>

            <h3>Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by law, GeoLearn shall not be liable for any 
              indirect, incidental, special, or consequential damages arising from your use of the platform.
            </p>

            <h2>Termination</h2>
            <p>
              Either party may terminate this agreement at any time. Upon termination:
            </p>
            <ul>
              <li>Your access to the platform will be discontinued</li>
              <li>Certain provisions of these terms will survive termination</li>
              <li>Refunds will be handled according to our refund policy</li>
            </ul>

            <h2>Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Material changes will be 
              communicated through the platform or via email.
            </p>

            <h2>Governing Law</h2>
            <p>
              These terms are governed by and construed in accordance with applicable laws. 
              Any disputes will be resolved through binding arbitration.
            </p>

            <h2>Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at:
            </p>
            <ul>
              <li>Email: legal@geolearn.com</li>
              <li>Address: Global Online Platform</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;
