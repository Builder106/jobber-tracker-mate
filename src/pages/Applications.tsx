import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ApplicationCard, { Application } from "@/components/applications/ApplicationCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/ui/StatusBadge";
import { NewApplicationForm } from "@/components/applications/NewApplicationForm";
import { Search, Plus } from "lucide-react";
import { fetchCompanyLogo } from "@/utils/brandfetch";

const applications: Application[] = [
  {
    id: "1",
    company: "Apple Inc.",
    position: "Frontend Developer",
    location: "Cupertino, CA",
    status: "applied",
    date: "June 12, 2023",
    link: "#",
  },
  {
    id: "2",
    company: "Google",
    position: "UX Designer",
    location: "Mountain View, CA",
    status: "interview",
    date: "June 8, 2023",
    link: "#",
  },
  {
    id: "3",
    company: "Microsoft",
    position: "Software Engineer",
    location: "Redmond, WA",
    status: "rejected",
    date: "May 28, 2023",
    link: "#",
  },
  {
    id: "4",
    company: "Amazon",
    position: "Product Manager",
    location: "Seattle, WA",
    status: "offer",
    date: "June 15, 2023",
    link: "#",
  },
  {
    id: "5",
    company: "Meta",
    position: "React Developer",
    location: "Menlo Park, CA",
    status: "applied",
    date: "June 1, 2023",
    link: "#",
  },
  {
    id: "6",
    company: "Netflix",
    position: "Full Stack Engineer",
    location: "Los Gatos, CA",
    status: "interview",
    date: "May 20, 2023",
    link: "#",
  },
];

const Applications = () => {
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewFormOpen, setIsNewFormOpen] = useState(false);
  const [applicationsList, setApplicationsList] = useState<Application[]>(applications);

  useEffect(() => {
    // Listen for the custom event from the navbar
    const handleOpenNewForm = () => {
      setIsNewFormOpen(true);
    };
    
    window.addEventListener("open-new-application-form", handleOpenNewForm);
    
    return () => {
      window.removeEventListener("open-new-application-form", handleOpenNewForm);
    };
  }, []);

  const filteredApplications = applicationsList.filter((app) => {
    const matchesFilter = !filter || app.status === filter;
    const matchesSearch = !searchQuery || 
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: applicationsList.length,
    applied: applicationsList.filter(a => a.status === "applied").length,
    interview: applicationsList.filter(a => a.status === "interview").length,
    offer: applicationsList.filter(a => a.status === "offer").length,
    rejected: applicationsList.filter(a => a.status === "rejected").length,
  };

  const handleApplicationAdded = async (newApplication: Application) => {
    // In a real app, this would save to a database and refresh the list
    // For now, we'll just add it to our local state
    
    // Try to fetch a logo for the company
    try {
      const logoUrl = await fetchCompanyLogo(newApplication.company);
      if (logoUrl) {
        newApplication.logo = logoUrl;
      }
    } catch (error) {
      console.error("Error fetching logo for new application:", error);
    }
    
    setApplicationsList([newApplication, ...applicationsList]);
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-slide-up">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-semibold tracking-tight">Applications</h1>
            <p className="text-muted-foreground">Manage and track your job applications</p>
          </div>
          <Button 
            onClick={() => setIsNewFormOpen(true)}
            className="animate-fade-in"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Application
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex overflow-x-auto pb-2 -mx-1 sm:pb-0">
            <Button
              variant={!filter ? "default" : "outline"}
              size="sm"
              className="mx-1 whitespace-nowrap"
              onClick={() => setFilter(null)}
            >
              All <span className="ml-1 text-xs">{statusCounts.all}</span>
            </Button>
            <Button
              variant={filter === "applied" ? "default" : "outline"}
              size="sm"
              className="mx-1 whitespace-nowrap"
              onClick={() => setFilter("applied")}
            >
              Applied <span className="ml-1 text-xs">{statusCounts.applied}</span>
            </Button>
            <Button
              variant={filter === "interview" ? "default" : "outline"}
              size="sm"
              className="mx-1 whitespace-nowrap"
              onClick={() => setFilter("interview")}
            >
              Interview <span className="ml-1 text-xs">{statusCounts.interview}</span>
            </Button>
            <Button
              variant={filter === "offer" ? "default" : "outline"}
              size="sm"
              className="mx-1 whitespace-nowrap"
              onClick={() => setFilter("offer")}
            >
              Offer <span className="ml-1 text-xs">{statusCounts.offer}</span>
            </Button>
            <Button
              variant={filter === "rejected" ? "default" : "outline"}
              size="sm"
              className="mx-1 whitespace-nowrap"
              onClick={() => setFilter("rejected")}
            >
              Rejected <span className="ml-1 text-xs">{statusCounts.rejected}</span>
            </Button>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))
          ) : (
            <div className="col-span-3 py-12 text-center">
              <h3 className="text-lg font-medium">No applications found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </div>

      <NewApplicationForm 
        open={isNewFormOpen} 
        onOpenChange={setIsNewFormOpen}
        onApplicationAdded={handleApplicationAdded}
      />
    </AppLayout>
  );
};

export default Applications;
