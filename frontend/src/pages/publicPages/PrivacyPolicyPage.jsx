import React, { useEffect, useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Loader } from '@/components/common/Loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, Lock, Eye, Users, FileText, 
  CheckCircle, AlertTriangle, Mail, Clock, ChevronRight,
  Database, Globe, Cookie, Bell, Download
} from 'lucide-react';

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      const scrollPosition = window.scrollY + 150;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('data-section');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(sectionId);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction', icon: FileText },
    { id: 'information-collect', title: 'Information We Collect', icon: Database },
    { id: 'how-use', title: 'How We Use Your Information', icon: Eye },
    { id: 'sharing', title: 'Information Sharing', icon: Users },
    { id: 'cookies', title: 'Cookies & Tracking', icon: Cookie },
    { id: 'security', title: 'Data Security', icon: Shield },
    { id: 'rights', title: 'Your Rights', icon: Lock },
    { id: 'children', title: 'Children\'s Privacy', icon: AlertTriangle },
    { id: 'international', title: 'International Transfers', icon: Globe },
    { id: 'changes', title: 'Policy Changes', icon: Bell },
    { id: 'contact', title: 'Contact Us', icon: Mail }
  ];

  const keyHighlights = [
    {
      icon: Shield,
      title: 'Data Protection',
      description: 'Industry-standard encryption and security measures'
    },
    {
      icon: Lock,
      title: 'Your Control',
      description: 'Full control over your personal data and privacy settings'
    },
    {
      icon: Eye,
      title: 'Transparency',
      description: 'Clear information about how we use your data'
    },
    {
      icon: CheckCircle,
      title: 'GDPR Compliant',
      description: 'Committed to international privacy standards'
    }
  ];

  return (
    <MainLayout communities={[]}>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-primary mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground mb-2">
            Your privacy is important to us. Learn how we protect your data.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: November 2, 2025</span>
          </div>
        </div>

        {/* Key Highlights */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {keyHighlights.map((highlight, index) => {
            const Icon = highlight.icon;
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-base">{highlight.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {highlight.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {tableOfContents.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            activeSection === item.id
                              ? 'bg-primary/10 text-primary border-l-2 border-primary'
                              : 'text-muted-foreground hover:bg-secondary'
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="text-left flex-1">{item.title}</span>
                          <ChevronRight className="h-4 w-4 shrink-0" />
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Introduction */}
            <section data-section="introduction">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    Introduction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Global Bene ("we," "our," or "us") is committed to protecting your privacy. 
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                    information when you use our platform.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    By using our services, you agree to the collection and use of information in 
                    accordance with this policy. We encourage you to read this policy carefully to 
                    understand our practices regarding your personal data.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Information We Collect */}
            <section data-section="information-collect">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Database className="h-6 w-6 text-primary" />
                    Information We Collect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Personal Information
                    </h3>
                    <ul className="space-y-2 text-muted-foreground ml-7">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Name, email address, and contact information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Profile information you choose to provide (bio, avatar, interests)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Posts, comments, and other content you create</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Communication preferences and settings</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Usage Information
                    </h3>
                    <ul className="space-y-2 text-muted-foreground ml-7">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>How you interact with our platform and features</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Pages visited, time spent, and navigation patterns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Device information (browser type, OS, IP address)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Log data and analytics information</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Information from Third Parties
                    </h3>
                    <ul className="space-y-2 text-muted-foreground ml-7">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Social media authentication data (if you choose to connect)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Analytics providers and service partners</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* How We Use Your Information */}
            <section data-section="how-use">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Eye className="h-6 w-6 text-primary" />
                    How We Use Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>To provide, maintain, and improve our services</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>To personalize your experience and show relevant content</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>To communicate updates, features, and important notifications</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>To ensure platform security and prevent fraud or abuse</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>To analyze usage patterns and improve functionality</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>To respond to support requests and provide customer service</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>To comply with legal obligations and enforce our terms</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Information Sharing */}
            <section data-section="sharing">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    Information Sharing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    We respect your privacy and do not sell, trade, or rent your personal information 
                    to third parties. We may share your information only in the following circumstances:
                  </p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                      <span><strong>With Your Consent:</strong> When you explicitly authorize us to share information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                      <span><strong>Legal Compliance:</strong> To comply with laws, regulations, or legal processes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                      <span><strong>Protection:</strong> To protect our rights, safety, and property, or that of our users</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                      <span><strong>Service Providers:</strong> With trusted partners who assist in platform operations (under strict confidentiality agreements)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Cookies & Tracking */}
            <section data-section="cookies">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Cookie className="h-6 w-6 text-primary" />
                    Cookies & Tracking Technologies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    We use cookies and similar tracking technologies to enhance your experience, 
                    analyze usage, and provide personalized content. Types of cookies we use:
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <h4 className="font-semibold mb-2">Essential Cookies</h4>
                      <p className="text-sm text-muted-foreground">Required for basic platform functionality and security</p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <h4 className="font-semibold mb-2">Performance Cookies</h4>
                      <p className="text-sm text-muted-foreground">Help us understand how visitors interact with our platform</p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <h4 className="font-semibold mb-2">Functionality Cookies</h4>
                      <p className="text-sm text-muted-foreground">Remember your preferences and settings</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You can control cookies through your browser settings. However, disabling cookies may 
                    limit your ability to use certain features.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Data Security */}
            <section data-section="security">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    Data Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    We implement industry-standard security measures to protect your personal information 
                    from unauthorized access, alteration, disclosure, or destruction:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>End-to-end encryption for data transmission</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Secure servers and regular security audits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Access controls and authentication protocols</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Regular backups and disaster recovery procedures</span>
                    </li>
                  </ul>
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Important:</strong> While we strive to protect your data, no method of 
                      transmission over the internet is 100% secure. We cannot guarantee absolute security.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Your Rights */}
            <section data-section="rights">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Lock className="h-6 w-6 text-primary" />
                    Your Privacy Rights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    You have the following rights regarding your personal data:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Eye className="h-4 w-4 text-primary" />
                        Access
                      </h4>
                      <p className="text-sm text-muted-foreground">Request a copy of your personal data</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Correction
                      </h4>
                      <p className="text-sm text-muted-foreground">Update or correct inaccurate information</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-primary" />
                        Deletion
                      </h4>
                      <p className="text-sm text-muted-foreground">Request deletion of your account and data</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Download className="h-4 w-4 text-primary" />
                        Portability
                      </h4>
                      <p className="text-sm text-muted-foreground">Export your data in a portable format</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary" />
                        Restriction
                      </h4>
                      <p className="text-sm text-muted-foreground">Limit how we process your data</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Opt-out
                      </h4>
                      <p className="text-sm text-muted-foreground">Withdraw consent for data processing</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    To exercise any of these rights, please contact us at <strong>privacy@globalbene.com</strong>
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Children's Privacy */}
            <section data-section="children">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-primary" />
                    Children's Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Our platform is not intended for children under 13 years of age. We do not knowingly 
                    collect personal information from children under 13. If you are a parent or guardian 
                    and believe your child has provided us with personal information, please contact us 
                    immediately.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    If we become aware that we have collected personal information from a child under 13 
                    without parental consent, we will take steps to delete that information promptly.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* International Transfers */}
            <section data-section="international">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Globe className="h-6 w-6 text-primary" />
                    International Data Transfers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Your information may be transferred to and maintained on servers located outside of 
                    your country, where data protection laws may differ. By using our services, you consent 
                    to this transfer.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We ensure appropriate safeguards are in place to protect your data in accordance with 
                    this Privacy Policy and applicable laws, including GDPR for European users.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Policy Changes */}
            <section data-section="changes">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Bell className="h-6 w-6 text-primary" />
                    Changes to This Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    We may update this Privacy Policy from time to time to reflect changes in our practices 
                    or for legal, operational, or regulatory reasons. We will notify you of any material 
                    changes by:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Posting the updated policy on this page</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Updating the "Last Updated" date</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Sending an email notification for significant changes</span>
                    </li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed">
                    We encourage you to review this policy periodically to stay informed about how we 
                    protect your information.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Contact */}
            <section data-section="contact">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Mail className="h-6 w-6 text-primary" />
                    Contact Us
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    If you have questions, concerns, or requests regarding this Privacy Policy or 
                    our data practices, please contact us:
                  </p>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <span><strong>Email:</strong> privacy@globalbene.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary" />
                      <span><strong>Website:</strong> www.globalbene.com/privacy</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <strong>Mailing Address:</strong><br />
                        Global Bene - Privacy Team<br />
                        123 Innovation Street<br />
                        San Francisco, CA 94105<br />
                        United States
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button className="gap-2">
                      <Mail className="h-4 w-4" />
                      Contact Privacy Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicyPage;