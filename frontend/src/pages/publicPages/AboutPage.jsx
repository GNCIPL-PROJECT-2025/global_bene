import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from '@/Layouts/MainLayout';
import { getAllCommunities } from '@/redux/slice/community.slice';
import { Loader } from '@/components/common/Loader';
import { Users, Target, Heart, Globe, ArrowRight } from 'lucide-react';

const AboutPage = () => {
  const dispatch = useDispatch();
  const { communities, loading: communitiesLoading } = useSelector(state => state.community);

  useEffect(() => {
    dispatch(getAllCommunities());
  }, [dispatch]);

  if (communitiesLoading) {
    return (
      <MainLayout communities={communities || []}>
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  const stats = [
    { label: 'Active Communities', value: communities?.length || 0, icon: Users },
    { label: 'Global Reach', value: '50+', icon: Globe },
    { label: 'Impact Projects', value: '200+', icon: Target },
    { label: 'Members', value: '10K+', icon: Heart }
  ];

  const values = [
    {
      title: 'Community First',
      description: 'We prioritize the needs and voices of our communities.',
      icon: Users
    },
    {
      title: 'Transparency',
      description: 'Open communication and honest practices guide everything we do.',
      icon: Target
    },
    {
      title: 'Inclusivity',
      description: 'We welcome diverse perspectives and backgrounds.',
      icon: Heart
    },
    {
      title: 'Global Impact',
      description: 'Creating positive change across borders and cultures.',
      icon: Globe
    }
  ];

  return (
    <MainLayout communities={communities || []}>
      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary mb-6">About Global Bene</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connecting communities worldwide for positive change. Together, we're building 
            a network of changemakers committed to making the world a better place.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center p-6 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <Icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              Global Bene is dedicated to creating meaningful connections between communities, 
              fostering collaboration, and promoting positive social impact across the globe. 
              We believe in the power of shared knowledge and collective action to drive 
              sustainable change.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Through our platform, we empower individuals and organizations to collaborate 
              on projects that matter, share resources, and amplify their impact.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-semibold mb-4">What We Do</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">Connect like-minded individuals and communities worldwide</span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">Facilitate knowledge sharing and collaborative learning</span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">Support social impact initiatives and projects</span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">Promote sustainable development goals</span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">Build bridges between local and global communities</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="p-6 rounded-lg border border-border hover:border-primary transition-colors">
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-primary/10 rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-semibold mb-4">Get Involved</h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-6">
            Join our growing community of changemakers. Whether you're looking to 
            share knowledge, find collaborators, or make a difference, Global Bene 
            provides the platform to turn your ideas into action.
          </p>
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
            Join Our Community
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;