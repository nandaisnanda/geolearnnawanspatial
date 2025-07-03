
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  featured: boolean | null;
  created_at: string | null;
  profiles?: {
    username: string | null;
    full_name: string | null;
  } | null;
}

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch blog posts from database
  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles (username, full_name)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BlogPost[];
    }
  });

  const categories = ['All', ...Array.from(new Set(blogPosts.map(post => post.category).filter(Boolean)))];

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = filteredPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  const getCategoryColor = (category: string | null) => {
    if (!category) return "bg-geo-accent/10 text-geo-accent border-geo-accent/30";
    
    const colors = {
      "Industry Trends": "bg-blue-500/10 text-blue-500 border-blue-500/30",
      "Programming": "bg-green-500/10 text-green-500 border-green-500/30",
      "Remote Sensing": "bg-purple-500/10 text-purple-500 border-purple-500/30",
      "Web Development": "bg-orange-500/10 text-orange-500 border-orange-500/30",
      "Career": "bg-pink-500/10 text-pink-500 border-pink-500/30",
      "Open Source": "bg-teal-500/10 text-teal-500 border-teal-500/30"
    };
    return colors[category as keyof typeof colors] || "bg-geo-accent/10 text-geo-accent border-geo-accent/30";
  };

  const getAuthorName = (profiles: { username: string | null; full_name: string | null; } | null) => {
    if (!profiles) return 'Anonymous';
    return profiles.full_name || profiles.username || 'Anonymous';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-geo-accent"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
            GeoLearn Blog
          </h1>
          <p className="text-muted-foreground">
            Insights, tutorials, and industry news from GIS experts
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <Card className="glass-effect glow-border mb-8 hover:scale-105 transition-transform">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              <div className="aspect-video bg-gradient-to-br from-geo-accent/20 to-geo-highlight/20 rounded-lg flex items-center justify-center text-6xl">
                📊
              </div>
              <div className="space-y-4">
                <Badge className={getCategoryColor(featuredPost.category)}>
                  Featured • {featuredPost.category || 'General'}
                </Badge>
                <h2 className="text-2xl font-bold">{featuredPost.title}</h2>
                <p className="text-muted-foreground">{featuredPost.excerpt || featuredPost.content.substring(0, 150) + '...'}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {getAuthorName(featuredPost.profiles)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(featuredPost.created_at)}
                  </div>
                  <span>{calculateReadTime(featuredPost.content)}</span>
                </div>
                <Button className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black">
                  Read Full Article
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category 
                ? "bg-geo-accent text-black hover:bg-geo-accent/90" 
                : "hover:bg-geo-accent/10 hover:text-geo-accent"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        {regularPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post, index) => (
              <Card key={post.id} className="glass-effect glow-border hover:scale-105 transition-transform">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-geo-accent/20 to-geo-highlight/20 flex items-center justify-center text-4xl">
                    {index % 2 === 0 ? '🌍' : '📈'}
                  </div>
                  <div className="p-6">
                    <Badge className={`${getCategoryColor(post.category)} mb-3`}>
                      {post.category || 'General'}
                    </Badge>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt || post.content.substring(0, 100) + '...'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {getAuthorName(post.profiles)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{calculateReadTime(post.content)}</span>
                      <Button size="sm" variant="ghost" className="text-geo-accent hover:text-geo-highlight">
                        Read More
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-effect glow-border">
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">No Blog Posts Yet</h3>
              <p className="text-muted-foreground">Check back soon for exciting content from our GIS experts!</p>
            </CardContent>
          </Card>
        )}

        {/* Newsletter Signup */}
        <Card className="glass-effect glow-border mt-12">
          <CardHeader className="text-center">
            <CardTitle>Stay Updated</CardTitle>
            <p className="text-muted-foreground">
              Subscribe to our newsletter for the latest GIS insights and tutorials
            </p>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 bg-background border border-border rounded-md"
            />
            <Button className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black">
              Subscribe
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
