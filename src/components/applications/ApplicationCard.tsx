
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import StatusBadge from "@/components/ui/StatusBadge";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type Application = {
  id: string;
  company: string;
  position: string;
  location: string;
  status: "applied" | "interview" | "offer" | "rejected";
  date: string;
  logo?: string;
  link?: string;
};

interface ApplicationCardProps {
  application: Application;
  className?: string;
}

const statusLabels = {
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

const ApplicationCard = ({ application, className }: ApplicationCardProps) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-card card-hover border",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
            {application.logo ? (
              <img 
                src={application.logo} 
                alt={`${application.company} logo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-xl font-bold text-primary">
                {application.company.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg leading-tight truncate">{application.position}</h3>
            <p className="text-sm text-muted-foreground truncate">{application.company}</p>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge variant={application.status}>
                {statusLabels[application.status]}
              </StatusBadge>
              <span className="text-xs text-muted-foreground">
                {application.location}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 bg-muted/30 border-t flex items-center text-xs text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          <span>{application.date}</span>
        </div>
        {application.link && (
          <a 
            href={application.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-auto text-primary hover:underline"
          >
            View Job
          </a>
        )}
      </CardFooter>
    </Card>
  );
};

export default ApplicationCard;
