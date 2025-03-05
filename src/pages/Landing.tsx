import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  BarChart2,
  Calendar,
  CheckCircle2,
  Clock,
  Layout,
  ArrowUpRight,
  Target,
  Rocket,
} from "lucide-react";

const Landing = (): JSX.Element => {
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

  const steps = [
    {
      number: "1",
      title: "Create Account",
      description: "Sign up in seconds and customize your job search preferences"
    },
    {
      number: "2",
      title: "Track Applications",
      description: "Add and organize your job applications with our intuitive interface"
    },
    {
      number: "3",
      title: "Get Insights",
      description: "Receive personalized analytics and tips to improve your success rate"
    }
  ];



  return (
    <div className="min-h-screen bg-background">
      {/* Announcement Banner */}
      <div className="bg-primary/10 text-primary px-4 py-2 text-center text-sm font-medium">
        <span className="inline-flex items-center">
          🎉 New: AI-powered resume analysis now available
          <Button variant="link" className="h-auto p-0 ml-2" onClick={() => navigate("/auth")}>
            Try it free <ArrowUpRight className="h-3 w-3 ml-1" />
          </Button>
        </span>
      </div>

      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        <div className="absolute inset-x-0 top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:top-80">
          <div className="relative right-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:right-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Rocket className="h-4 w-4" />
              <span className="text-sm font-medium">Supercharge Your Job Search</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50 animate-slide-up">
              Your Personal Job Search Command Center
            </h1>
            <p className="text-xl leading-8 text-muted-foreground mb-8 animate-slide-up delay-100">
              Stop juggling spreadsheets and emails. Start managing your entire job search journey in one powerful, intuitive platform designed to help you land your dream role faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
              <Button size="lg" onClick={() => navigate("/auth")} className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-primary/90">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/features")} className="w-full sm:w-auto">
                Explore Features
                <Target className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground animate-fade-in delay-300">
              ✨ No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>



      {/* How it Works Section */}
      <div className="py-24 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Simple Process
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              How CareerClutch Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in minutes and streamline your entire job search process
            </p>
          </div>
          
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {index < steps.length - 1 && (
                    <div className="absolute hidden md:block top-12 left-[60%] w-full h-0.5 bg-primary/30" />
                  )}
                  <div className="relative flex flex-col items-center p-6 bg-background rounded-lg shadow-lg">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-center text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32 bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">Built for Job Seekers</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Your All-in-One Job Search Toolkit
            </h2>
            <p className="text-lg text-muted-foreground">
              Every tool you need to organize, track, and succeed in your job search journey
            </p>
          </div>
          
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden p-6 hover:-translate-y-1 transition-all duration-200 hover:shadow-lg border-primary/10 hover:border-primary/30"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative isolate px-6 py-24 sm:py-32 lg:px-8 bg-primary/5">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px)] bg-[size:14px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of job seekers who have streamlined their job search process and landed their dream roles faster with CareerClutch.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/auth")} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <Separator className="my-8" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-primary mb-2">14 Days</div>
              <div className="text-sm text-muted-foreground">Free Trial</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-primary mb-2">5 Minutes</div>
              <div className="text-sm text-muted-foreground">Setup Time</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;