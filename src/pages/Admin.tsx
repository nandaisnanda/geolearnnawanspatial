
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import CourseManager from '@/components/admin/CourseManager';
import QuizManager from '@/components/admin/QuizManager';
import BlogManager from '@/components/admin/BlogManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, BarChart3, Settings, FileQuestion, PenTool } from 'lucide-react';

const Admin = () => {
  const { profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-geo-accent"></div>
        </div>
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <Card className="glass-effect glow-border">
            <CardContent className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4 text-red-500">Access Denied</h1>
              <p className="text-muted-foreground">You don't have permission to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'quizzes', label: 'Quizzes', icon: FileQuestion },
    { id: 'blogs', label: 'Blog Posts', icon: PenTool },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'courses':
        return <CourseManager />;
      case 'quizzes':
        return <QuizManager />;
      case 'blogs':
        return <BlogManager />;
      case 'users':
        return (
          <Card className="glass-effect glow-border">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">User management features coming soon...</p>
            </CardContent>
          </Card>
        );
      case 'settings':
        return (
          <Card className="glass-effect glow-border">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System settings coming soon...</p>
            </CardContent>
          </Card>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-geo-primary via-background to-geo-secondary">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-highlight to-geo-accent bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your GeoLearn platform content and users
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-effect glow-border">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? 'default' : 'ghost'}
                        className={`w-full justify-start ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-geo-accent to-geo-highlight text-black'
                            : 'hover:bg-geo-accent/10'
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {tab.label}
                      </Button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
