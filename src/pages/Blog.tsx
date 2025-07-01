
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Blog = () => {
  const blogPosts = [
    {
      title: "The Future of GIS: Trends to Watch in 2024",
      excerpt: "Explore the latest developments in Geographic Information Systems and how they're shaping various industries.",
      author: "Dr. Sarah Johnson",
      date: "2024-06-15",
      category: "Industry Trends",
      readTime: "5 min read",
      featured: true
    },
    {
      title: "Getting Started with Python for GIS Automation",
      excerpt: "Learn how to automate repetitive GIS tasks using Python scripting and popular libraries like ArcPy and GeoPandas.",
      author: "Mike Chen",
      date: "2024-06-10",
      category: "Programming",
      readTime: "8 min read",
      featured: false
    },
    {
      title: "Remote Sensing Applications in Climate Research",
      excerpt: "Discover how satellite imagery and remote sensing technologies are helping scientists understand climate change.",
      author: "Dr. Maria Rodriguez",
      date: "2024-06-05",
      category: "Remote Sensing",
      readTime: "6 min read",
      featured: false
    },
    {
      title: "Building Interactive Web Maps with Modern Technologies",
      excerpt: "A comprehensive guide to creating engaging web-based mapping applications using JavaScript libraries.",
      author: "Alex Thompson",
      date: "2024-05-28",
      category: "Web Development",
      readTime: "10 min read",
      featured: false
    },
    {
      title: "Career Paths in GIS: From Analyst to Manager",
      excerpt: "Explore different career trajectories in the GIS field and what skills you need to advance your career.",
      author: "Jennifer Kim",
      date: "2024-05-20",
      category: "Career",
      readTime: "7 min read",
      featured: false
    },
    {
      title: "Open Source GIS Tools: Alternatives to Commercial Software",
      excerpt: "Compare popular open source GIS solutions and learn when they might be the right choice for your projects.",
      author: "David Wilson",
      date: "2024-05-15",
      category: "Open Source",
      readTime: "9 min read",
      featured: false
    }
  ];

  const categories = ["All", "Industry Trends", "Programming", "Remote Sensing", "Web Development", "Career", "Open Source"];

  const getCategoryColor = (category: string) => {
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

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

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
                  Featured • {featuredPost.category}
                </Badge>
                <h2 className="text-2xl font-bold">{featuredPost.title}</h2>
                <p className="text-muted-foreground">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(featuredPost.date).toLocaleDateString()}
                  </div>
                  <span>{featuredPost.readTime}</span>
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
              variant="outline"
              size="sm"
              className="hover:bg-geo-accent/10 hover:text-geo-accent"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post, index) => (
            <Card key={index} className="glass-effect glow-border hover:scale-105 transition-transform">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-geo-accent/20 to-geo-highlight/20 flex items-center justify-center text-4xl">
                  {index % 2 === 0 ? '🌍' : '📈'}
                </div>
                <div className="p-6">
                  <Badge className={`${getCategoryColor(post.category)} mb-3`}>
                    {post.category}
                  </Badge>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
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
