import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart2,
  Calendar,
  CheckCircle2,
  Clock,
  Layout,
  CheckCircle,
  ArrowUpRight
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Layout className="h-6 w-6" />,
      title: "Centralized Dashboard",
      description: "Track all your applications in one place with our intuitive dashboard"
    },
    {
      icon: <BarChart2 className="h-6 w-6" />,
      title: "Smart Analytics",
      description: "Get insights into your application success rate and interview performance"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Interview Calendar",
      description: "Seamlessly manage interview schedules with automated reminders"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Timeline View",
      description: "Visualize your entire job search journey with our interactive timeline"
    },
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: "Application Checklist",
      description: "Never miss a step with our comprehensive application checklist"
    }
  ];

  const stats = [
    { value: "85%", label: "Success Rate" },
    { value: "24h", label: "Avg. Response Time" },
    { value: "2x", label: "Interview Rate" },
    { value: "4.9", label: "User Rating" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Announcement Banner */}
      <div className="bg-primary/10 text-primary px-4 py-2 text-center text-sm font-medium">
        <span className="inline-flex items-center">
          🎉 New: AI-powered resume analysis now available
          <Button variant="link" className="h-auto p-0 ml-2" onClick={() => navigate("/signup")}>
            Try it free <ArrowUpRight className="h-3 w-3 ml-1" />
          </Button>
        </span>
      </div>

      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 animate-fade-in">
              The Job Search Assistant
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50 animate-slide-up">
              Land Your Dream Job Faster
            </h1>
            <p className="text-xl leading-8 text-muted-foreground mb-8 animate-slide-up delay-100">
              The all-in-one platform that helps you organize your job search, track applications, and increase your interview success rate by <span className="font-semibold text-foreground">2x</span>.
            </p>
            <div className="flex items-center justify-center gap-4 animate-slide-up delay-200">
              <Button size="lg" onClick={() => navigate("/signup")} className="shadow-lg hover:shadow-xl transition-shadow">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/auth")}>
                See Demo
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground animate-fade-in delay-300">
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="border-y bg-muted/50">
        <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Powerful Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-muted-foreground">
              Our comprehensive toolkit helps you stay organized and focused on landing your dream role
            </p>
          </div>
          
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="relative p-6 hover:-translate-y-1 transition-all duration-200 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative isolate px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
        
        <Card className="mx-auto max-w-3xl text-center p-8 shadow-lg">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to transform your job search?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground mb-8">
            Join thousands of job seekers who have streamlined their job search and landed their dream roles faster.
          </p>
          <div className="flex items-center justify-center gap-x-6">
            <Button size="lg" onClick={() => navigate("/signup")} className="shadow-lg">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/pricing")}>
              View pricing
            </Button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-primary" />
            14-day free trial
            <CheckCircle className="h-4 w-4 text-primary ml-4" />
            No credit card required
            <CheckCircle className="h-4 w-4 text-primary ml-4" />
            Cancel anytime
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Landing;