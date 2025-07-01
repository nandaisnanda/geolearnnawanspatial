
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import CourseList from '@/components/learn/CourseList';
import CourseViewer from '@/components/learn/CourseViewer';
import LessonViewer from '@/components/learn/LessonViewer';

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  video_url?: string;
  pdf_url?: string;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  pdf_url: string;
  order_index: number;
  created_at: string;
}

const Learn = () => {
  const { profile, user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Fetch enrolled courses
  const { data: enrolledCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['enrolled-courses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            difficulty_level,
            video_url,
            pdf_url
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch lessons for selected course
  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', selectedCourse?.id],
    queryFn: async () => {
      if (!selectedCourse?.id) return [];
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', selectedCourse.id)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCourse?.id
  });

  // If viewing a specific lesson
  if (selectedLesson) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <LessonViewer 
            lesson={selectedLesson} 
            onBack={() => setSelectedLesson(null)} 
          />
        </div>
      </div>
    );
  }

  // If viewing a specific course
  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <CourseViewer 
            course={selectedCourse}
            lessons={lessons}
            onBack={() => setSelectedCourse(null)}
            onSelectLesson={setSelectedLesson}
          />
        </div>
      </div>
    );
  }

  // Main courses list view
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <CourseList 
          enrolledCourses={enrolledCourses}
          coursesLoading={coursesLoading}
          onSelectCourse={setSelectedCourse}
          profile={profile}
        />
      </div>
    </div>
  );
};

export default Learn;
