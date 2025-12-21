import React, { useEffect, useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Loader } from '@/components/common/Loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, Scale, Shield, AlertTriangle, Users, Lock, 
  CheckCircle, XCircle, Mail, Clock, ChevronRight, 
  Ban, Gavel, BookOpen, MessageSquare, Copyright, Globe
} from 'lucide-react';

const TermsConditionPage = () => {
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
    { id: 'acceptance', title: 'Acceptance of Terms', icon: FileText },
    { id: 'license', title: 'Use License', icon: Scale },
    { id: 'conduct', title: 'User Conduct', icon: Users },
    { id: 'content', title: 'Content & Ownership', icon: Copyright },
    { id: 'guidelines', title: 'Community Guidelines', icon: MessageSquare },
    { id: 'prohibited', title: 'Prohibited Activities', icon: Ban },
    { id: 'intellectual', title: 'Intellectual Property', icon: BookOpen },
    { id: 'termination', title: 'Account Termination', icon: XCircle },
    { id: 'liability', title: 'Limitation of Liability', icon: Shield },
    { id: 'dispute', title: 'Dispute Resolution', icon: Gavel },
    { id: 'changes', title: 'Changes to Terms', icon: AlertTriangle },
    { id: 'contact', title: 'Contact Information', icon: Mail }
  ];

  const keyPoints = [
    {
      icon: CheckCircle,
      title: 'User Rights',
      description: 'Clear rights and responsibilities for all users',
      color: 'text-green-500'
    },
    {
      icon: Shield,
      title: 'Privacy Protected',
      description: 'Your data security is our priority',
      color: 'text-blue-500'
    },
    {
      icon: Users,
      title: 'Fair Community',
      description: 'Equal treatment and opportunity for everyone',
      color: 'text-purple-500'
    },
    {
      icon: Scale,
      title: 'Legal Compliance',
      description: 'Adhering to international laws and regulations',
      color: 'text-orange-500'
    }
  ];

  return (
    <MainLayout communities={[]}>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Scale className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-primary mb-4">Terms of Service</h1>
          <p className="text-lg text-muted-foreground mb-2">
            Please read these terms carefully before using Global Bene
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: November 2, 2025</span>
          </div>
        </div>

        {/* Key Points */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {keyPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Icon className={`h-8 w-8 ${point.color} mx-auto mb-2`} />
                  <CardTitle className="text-base">{point.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {point.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Important Notice */}
        <div className="mb-12 p-6 bg-orange-50 border-2 border-orange-200 rounded-lg">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-orange-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-orange-900 mb-2">Important Notice</h3>
              <p className="text-orange-800 leading-relaxed">
                By accessing or using Global Bene, you agree to be bound by these Terms of Service. 
                If you disagree with any part of these terms, you may not access or use our services. 
                Please read these terms carefully and contact us if you have any questions.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Navigation</CardTitle>
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
            {/* Acceptance of Terms */}
            <section data-section="acceptance">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    Acceptance of Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing and using Global Bene, you accept and agree to be bound by the 
                    terms and provision of this agreement. If you do not agree to abide by the 
                    above, please do not use this service.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms of Service constitute a legally binding agreement between you and 
                    Global Bene. Your continued use of the Platform signifies your acceptance of 
                    these terms and any future modifications.
                  </p>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> You must be at least 13 years old to use this platform.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Use License */}
            <section data-section="license">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Scale className="h-6 w-6 text-primary" />
                    Use License
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Permission is granted to temporarily access Global Bene for personal, 
                    non-commercial transitory viewing only. This is the grant of a license, not a 
                    transfer of title, and under this license you may not:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span>Modify or copy the materials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span>Use the materials for any commercial purpose or for any public display</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span>Attempt to reverse engineer any software contained on the platform</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span>Remove any copyright or other proprietary notations from the materials</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* User Conduct */}
            <section data-section="conduct">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    User Conduct
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    You agree to use Global Bene responsibly and not to:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Ban className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span>Post harmful, threatening, abusive, or harassing content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span>Violate any applicable laws or regulations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span>Infringe upon intellectual property rights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span>Spam or send unsolicited messages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span>Impersonate others or provide false information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span>Attempt to gain unauthorized access to the platform</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Content */}
            <section data-section="content">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Copyright className="h-6 w-6 text-primary" />
                    Content Ownership
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    You retain ownership of content you post on Global Bene. However, by posting 
                    content, you grant us a worldwide, non-exclusive, royalty-free license to use, 
                    display, and distribute your content on the platform.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Community Guidelines */}
            <section data-section="guidelines">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    Community Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Be respectful and constructive in your interactions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Keep content relevant to the community topic</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Respect diverse opinions and backgrounds</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Report inappropriate content when you see it</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Follow community-specific rules set by moderators</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Prohibited Activities */}
            <section data-section="prohibited">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Ban className="h-6 w-6 text-red-600" />
                    Prohibited Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    The following activities are strictly prohibited and may result in immediate 
                    account termination:
                  </p>
                  <div className="space-y-2">
                    {[
                      'Harassment, hate speech, or discrimination',
                      'Violence, threats, or incitement to harm',
                      'Illegal activities or promotion thereof',
                      'Fraud, scams, or deceptive practices',
                      'Automated scraping or data harvesting',
                      'Creating multiple fake accounts'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                        <Ban className="h-4 w-4 text-red-600 shrink-0 mt-1" />
                        <span className="text-sm text-red-800">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Intellectual Property */}
            <section data-section="intellectual">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    Intellectual Property
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    The Platform and its original content, features, and functionality are owned by 
                    Global Bene and are protected by international copyright, trademark, and other 
                    intellectual property laws.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Termination */}
            <section data-section="termination">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <XCircle className="h-6 w-6 text-primary" />
                    Account Termination
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    We may terminate or suspend your access to Global Bene at any time, without 
                    prior notice, for conduct that we believe violates these Terms of Service or 
                    is harmful to other users, us, or third parties.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Limitation of Liability */}
            <section data-section="liability">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    Limitation of Liability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    The information on Global Bene is provided on an 'as is' basis. To the fullest 
                    extent permitted by law, we exclude all representations, warranties, and 
                    conditions relating to our platform and the use of this platform.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Dispute Resolution */}
            <section data-section="dispute">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Gavel className="h-6 w-6 text-primary" />
                    Dispute Resolution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Any disputes arising from these terms will be resolved through binding arbitration 
                    in accordance with applicable laws. We encourage informal resolution first by 
                    contacting our support team.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Changes to Terms */}
            <section data-section="changes">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-primary" />
                    Changes to Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify these terms at any time. If changes are material, 
                    we will provide at least 30 days' notice. Continued use of the platform after 
                    changes indicates acceptance of the new terms.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Contact Information */}
            <section data-section="contact">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Mail className="h-6 w-6 text-primary" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <span><strong>Email:</strong> legal@globalbene.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary" />
                      <span><strong>Website:</strong> www.globalbene.com/terms</span>
                    </div>
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

export default TermsConditionPage;
