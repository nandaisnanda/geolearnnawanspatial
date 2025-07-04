
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseQuiz from '@/components/CourseQuiz';
import { useCourseData } from '@/hooks/useCourseData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import QuizLeaderboard from '@/components/QuizLeaderboard';

const Quiz = () => {
  const { enrolledCourses } = useCourseData();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

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

        {/* Course Selection */}
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-md">
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course to take quiz" />
              </SelectTrigger>
              <SelectContent>
                {enrolledCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Section */}
          <div className="lg:col-span-2">
            <CourseQuiz courseId={selectedCourseId} />
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
