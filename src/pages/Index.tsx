
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Dashboard from "@/components/Dashboard";
import FeaturedCourses from "@/components/FeaturedCourses";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <Dashboard />
      <FeaturedCourses />
      <Footer />
    </div>
  );
};

export default Index;
