import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StatusBadge from '@/components/ui/StatusBadge';
import { Application } from './ApplicationCard';

interface StatusChangeConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  newStatus: Application['status'] | null;
  onConfirm: () => void;
}

const statusLabels = {
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export function StatusChangeConfirmation({
  open,
  onOpenChange,
  application,
  newStatus,
  onConfirm,
}: StatusChangeConfirmationProps) {
  if (!application || !newStatus) return null;

  const getStatusChangeMessage = () => {
    if (newStatus === 'interview') {
      return "Congratulations on getting an interview! Would you like to add any notes about the interview process?";
    } else if (newStatus === 'offer') {
      return "Congratulations on receiving an offer! Would you like to add details about the offer?";
    } else if (newStatus === 'rejected') {
      return "Sorry to hear about the rejection. Remember that each application is a learning experience.";
    } else {
      return "Are you sure you want to change the status?";
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change Application Status</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="mb-4">
              {getStatusChangeMessage()}
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">From:</span>
                <StatusBadge variant={application.status}>
                  {statusLabels[application.status]}
                </StatusBadge>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">To:</span>
                <StatusBadge variant={newStatus}>
                  {statusLabels[newStatus]}
                </StatusBadge>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>{application.position}</strong> at <strong>{application.company}</strong>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm Change</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
