import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCourseData } from '@/hooks/useCourseData';
import { useCourseEnrollment } from '@/hooks/useCourseEnrollment';
import { Search, BookOpen, Clock, Users, Star, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Courses = () => {
  const { courses, isLoading, isEnrolled, getProgress } = useCourseData();
  const { handleEnroll, handleContinueLearning, isEnrolling } = useCourseEnrollment();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty_level === selectedDifficulty;
    
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'enrolled' && isEnrolled(course.id)) ||
                         (selectedStatus === 'available' && !isEnrolled(course.id) && !course.coming_soon) ||
                         (selectedStatus === 'coming_soon' && course.coming_soon);
    
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-orange-500/20 text-orange-400';
      case 'expert': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-geo-primary via-background to-geo-secondary">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-geo-highlight to-geo-accent bg-clip-text text-transparent">
            All Courses
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our comprehensive collection of geospatial courses designed to advance your skills and knowledge.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Difficulty Filter */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="enrolled">My Courses</SelectItem>
                <SelectItem value="coming_soon">Coming Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              Active filters: {[
                searchTerm && 'Search',
                selectedDifficulty !== 'all' && 'Difficulty',
                selectedStatus !== 'all' && 'Status'
              ].filter(Boolean).join(', ') || 'None'}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glass-effect">
                <CardContent className="p-6">
                  <Skeleton className="h-40 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card className="glass-effect">
            <CardContent className="text-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDifficulty('all');
                  setSelectedStatus('all');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const enrolled = isEnrolled(course.id);
              const progress = enrolled ? getProgress(course.id) : 0;

              return (
                <Card key={course.id} className="glass-effect glow-border hover:scale-105 transition-all duration-300">
                  <CardHeader className="pb-3">
                    {/* Course Thumbnail */}
                    <div className="aspect-video bg-gradient-to-r from-geo-primary to-geo-secondary rounded-lg mb-4 flex items-center justify-center">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <BookOpen className="h-12 w-12 text-white/60" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(course.difficulty_level || 'beginner')}>
                          {course.difficulty_level || 'Beginner'}
                        </Badge>
                        {course.coming_soon && (
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            Coming Soon
                          </Badge>
                        )}
                        {enrolled && (
                          <Badge className="bg-geo-accent/20 text-geo-accent">
                            Enrolled
                          </Badge>
                        )}
                      </div>

                      <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {course.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {course.description}
                      </p>
                    )}

                    {/* Course Features */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      {course.video_url && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Video</span>
                        </div>
                      )}
                      {course.pdf_url && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          <span>PDF</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>Interactive</span>
                      </div>
                    </div>

                    {/* Progress Bar for Enrolled Courses */}
                    {enrolled && progress > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-geo-accent font-medium">{progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-geo-accent to-geo-highlight h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      onClick={() => enrolled ? handleContinueLearning() : handleEnroll(course)}
                      disabled={isEnrolling || course.coming_soon}
                      className={`w-full ${
                        enrolled
                          ? 'bg-geo-accent text-black hover:bg-geo-accent/90'
                          : course.coming_soon
                          ? 'opacity-50 cursor-not-allowed'
                          : 'bg-gradient-to-r from-geo-highlight to-geo-accent hover:from-geo-highlight/90 hover:to-geo-accent/90 text-black'
                      }`}
                    >
                      {course.coming_soon ? (
                        'Coming Soon'
                      ) : enrolled ? (
                        progress > 0 ? 'Continue Learning' : 'Start Learning'
                      ) : (
                        isEnrolling ? 'Enrolling...' : 'Enroll Now'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Courses;