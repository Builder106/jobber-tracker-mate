
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import StatusBadge from "@/components/ui/StatusBadge";
import { Calendar, ExternalLink, MoreVertical, Edit, Trash2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchCompanyLogo } from "@/utils/brandfetch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export type Application = {
  id: string;
  company: string;
  position: string;
  location: string;
  status: "applied" | "interview" | "offer" | "rejected";
  date: string;
  logo?: string;
  link?: string;
  notes?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

interface ApplicationCardProps {
  application: Application;
  className?: string;
  onEdit?: (application: Application) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, newStatus: Application['status']) => void;
}

const statusLabels = {
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

const ApplicationCard = ({ 
  application, 
  className, 
  onEdit, 
  onDelete,
  onStatusChange 
}: ApplicationCardProps) => {
  const [logo, setLogo] = useState<string | null>(application.logo || null);
  const [isLoadingLogo, setIsLoadingLogo] = useState<boolean>(false);
  const [logoError, setLogoError] = useState<boolean>(false);

  useEffect(() => {
    const loadLogo = async () => {
      // If we already have a logo, or we've already tried and failed, skip
      if (logo || logoError || isLoadingLogo) return;
      
      setIsLoadingLogo(true);
      try {
        const logoUrl = await fetchCompanyLogo(application.company);
        if (logoUrl) {
          setLogo(logoUrl);
        } else {
          setLogoError(true);
        }
      } catch (error) {
        console.error("Error loading logo:", error);
        setLogoError(true);
      } finally {
        setIsLoadingLogo(false);
      }
    };

    loadLogo();
  }, [application.company, logo, logoError, isLoadingLogo]);

  const handleStatusChange = async (newStatus: Application['status']) => {
    if (onStatusChange) {
      onStatusChange(application.id, newStatus);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(application.id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(application);
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-card card-hover border group",
        className
      )}
    >
      <CardContent className="p-6 relative">
        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive" 
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
            {logo ? (
              <img 
                src={logo} 
                alt={`${application.company} logo`}
                className="w-full h-full object-contain p-1"
                onError={() => {
                  setLogoError(true);
                  setLogo(null);
                }}
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                    <StatusBadge variant={application.status}>
                      {statusLabels[application.status]}
                    </StatusBadge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleStatusChange("applied")}>
                    <StatusBadge variant="applied" className="mr-2">Applied</StatusBadge>
                    Set as Applied
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("interview")}>
                    <StatusBadge variant="interview" className="mr-2">Interview</StatusBadge>
                    Set as Interview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("offer")}>
                    <StatusBadge variant="offer" className="mr-2">Offer</StatusBadge>
                    Set as Offer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("rejected")}>
                    <StatusBadge variant="rejected" className="mr-2">Rejected</StatusBadge>
                    Set as Rejected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-xs text-muted-foreground">
                {application.location}
              </span>
            </div>
          </div>
        </div>
        
        {application.notes && (
          <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-1 mb-1">
              <MessageSquare className="h-3 w-3" />
              <span className="text-xs font-medium">Notes</span>
            </div>
            <p className="line-clamp-2">{application.notes}</p>
          </div>
        )}
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
            className="ml-auto flex items-center text-primary hover:underline"
          >
            <span>View Job</span>
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        )}
      </CardFooter>
    </Card>
  );
};

export default ApplicationCard;
