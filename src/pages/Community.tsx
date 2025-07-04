
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CommunityForumOptimized from '@/components/CommunityForumOptimized';

const Community = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-geo-primary via-background to-geo-secondary">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-geo-highlight to-geo-accent bg-clip-text text-transparent">
            Community Forum
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Connect with fellow learners, share knowledge, and get help from the GeoLearn community.
          </p>
        </div>

        <CommunityForumOptimized />
      </div>

      <Footer />
    </div>
  );
};

export default Community;
