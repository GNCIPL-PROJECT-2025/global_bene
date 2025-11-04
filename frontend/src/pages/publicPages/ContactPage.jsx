import React, { useEffect, useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Loader } from '@/components/common/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mail, MessageSquare, HelpCircle, Phone, 
  Send, CheckCircle, ChevronDown, ChevronUp, Search, Clock
} from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Component mounted
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', category: 'general', message: '' });
      setIsSubmitting(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      detail: 'support@globalbene.com',
      action: 'Send Email',
      color: 'text-blue-500'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      detail: 'Available Mon-Fri, 9AM-6PM',
      action: 'Start Chat',
      color: 'text-green-500'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our team',
      detail: '+1 (555) 123-4567',
      action: 'Call Now',
      color: 'text-purple-500'
    },
    {
      icon: HelpCircle,
      title: 'Community Forum',
      description: 'Get help from our community',
      detail: 'Ask questions and share knowledge',
      action: 'Visit Forum',
      color: 'text-orange-500'
    }
  ];

  const faqs = [
    {
      question: 'How do I create a community?',
      answer: 'Creating a community is simple! Navigate to your dashboard and click the "Create Community" button. Fill in the required details including community name, description, and category. You can also set privacy settings and invite initial members.'
    },
    {
      question: 'How do I join a community?',
      answer: 'Browse the communities page to discover communities that match your interests. Click on any community card to view details, then click the "Join" button. Some communities may require approval from administrators.'
    },
    {
      question: 'Can I leave a community?',
      answer: 'Yes, you have full control over your memberships. Go to the community page, click on settings, and select "Leave Community". You can rejoin at any time if it\'s a public community.'
    },
    {
      question: 'How do I report inappropriate content?',
      answer: 'We take community safety seriously. Click the three-dot menu on any post or comment and select "Report". Choose the reason for reporting and provide additional details. Our moderation team reviews all reports within 24 hours.'
    },
    {
      question: 'What are the community guidelines?',
      answer: 'Our guidelines promote respect, inclusivity, and constructive engagement. Key rules include: no hate speech, harassment, or spam; respect intellectual property; maintain privacy; and contribute meaningfully to discussions.'
    },
    {
      question: 'How can I manage notifications?',
      answer: 'Access your account settings and navigate to the Notifications section. You can customize email notifications, push notifications, and in-app alerts for different activities like mentions, comments, and community updates.'
    },
    {
      question: 'Is my data secure on Global Bene?',
      answer: 'Absolutely. We use industry-standard encryption for all data transmission and storage. Your personal information is never shared with third parties without your consent. Read our Privacy Policy for full details.'
    },
    {
      question: 'How do I delete my account?',
      answer: 'Go to Account Settings > Privacy & Security > Delete Account. Note that this action is irreversible and will permanently remove all your data, posts, and community memberships after a 30-day grace period.'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout communities={[]}>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're here to help. Get in touch with us for support, questions, or feedback.
          </p>
        </div>

        {/* Contact Methods Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <Icon className={`h-8 w-8 ${method.color} mb-2`} />
                  <CardTitle className="text-lg">{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-3">{method.detail}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-4 gap-12 mb-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-semibold mb-6">Send us a message</h2>
            
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">
                  Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name *</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email *</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                >
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="feature">Feature Request</option>
                  <option value="bug">Bug Report</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Subject *</label>
                <Input
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="How can we help you?"
                  required
                  className={errors.subject ? 'border-red-500' : ''}
                />
                {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Message *</label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Please provide as much detail as possible..."
                  rows={6}
                  required
                  className={errors.message ? 'border-red-500' : ''}
                />
                {errors.message && <p className="text-sm text-red-500 mt-1">{errors.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>

            {/* Office Hours */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Support Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monday - Friday:</span>
                  <span className="font-medium">9:00 AM - 6:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday:</span>
                  <span className="font-medium">10:00 AM - 4:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sunday:</span>
                  <span className="font-medium">Closed</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-3xl font-semibold mb-4">Frequently Asked Questions</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No FAQs found matching your search.
                </p>
              ) : (
                filteredFaqs.map((faq, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader 
                      className="cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => toggleFaq(index)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium">
                          {faq.question}
                        </CardTitle>
                        {expandedFaq === index ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    {expandedFaq === index && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>

            {/* Additional Help */}
            <Card className="mt-6 bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Still need help?</CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Our support team is ready to assist you.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button variant="default">Contact Support</Button>
                <Button variant="outline">Browse Documentation</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactPage;