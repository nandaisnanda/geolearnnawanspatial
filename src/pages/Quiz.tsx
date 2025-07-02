
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseQuiz from '@/components/CourseQuiz';
import QuizLeaderboard from '@/components/QuizLeaderboard';

const Quiz = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-geo-primary via-background to-geo-secondary">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-geo-highlight to-geo-accent bg-clip-text text-transparent">
            Quiz Challenge
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Test your geospatial knowledge and compete with other learners on the leaderboard.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Section */}
          <div className="lg:col-span-2">
            <CourseQuiz />
          </div>
          
          {/* Leaderboard Section */}
          <div className="lg:col-span-1">
            <QuizLeaderboard />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Quiz;
