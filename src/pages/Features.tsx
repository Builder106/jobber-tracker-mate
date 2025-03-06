import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Features = () => {
  const features = [
    {
      title: "Application Tracking",
      description: "Keep track of all your job applications in one place with status updates and important dates.",
      icon: "📝",
    },
    {
      title: "Calendar Integration",
      description: "Manage your interviews and follow-ups with our built-in calendar system.",
      icon: "📅",
    },
    {
      title: "Progress Analytics",
      description: "Visualize your job search progress with detailed analytics and insights.",
      icon: "📊",
    },
    {
      title: "Document Management",
      description: "Store and organize your resumes, cover letters, and other important documents.",
      icon: "📁",
    },
    {
      title: "Interview Preparation",
      description: "Access tools and resources to help you prepare for interviews.",
      icon: "🎯",
    },
    {
      title: "Customizable Workflow",
      description: "Tailor the application tracking process to match your preferences.",
      icon: "⚙️",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Powerful Features for Your Job Search
        </h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Everything you need to organize, track, and succeed in your job search journey
        </p>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 flex flex-col items-start">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground mb-4">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="text-muted-foreground mb-8">
          Join thousands of job seekers who have streamlined their job search with Jobber Tracker Mate
        </p>
        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Features;
