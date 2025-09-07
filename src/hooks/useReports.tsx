
import React, { useState } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './useAuth';
import { useQuery } from '@tanstack/react-query';
import { toast } from './use-toast';

export interface Report {
  id: string;
  videoId: string;
  videoTitle: string;
  reportedBy: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: any;
  resolvedAt?: any;
  resolvedBy?: string;
}

export function useReports() {
  const { user } = useAuth();

  const submitReport = async (videoId: string, videoTitle: string, reason: string, description: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to report content.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addDoc(collection(db, 'reports'), {
        videoId,
        videoTitle,
        reportedBy: user.email,
        reason,
        description,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      toast({
        title: "Report submitted",
        description: "Thank you for reporting this content. We'll review it shortly.",
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { submitReport };
}

export function useAdminReports() {
  return useQuery({
    queryKey: ['adminReports'],
    queryFn: async () => {
      return new Promise<Report[]>((resolve) => {
        const q = query(
          collection(db, 'reports'),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const reports: Report[] = [];
          snapshot.forEach((doc) => {
            reports.push({ id: doc.id, ...doc.data() } as Report);
          });
          resolve(reports);
        });

        // Store unsubscribe function for cleanup
        return unsubscribe;
      });
    }
  });
}

export function useReportActions() {
  const { user } = useAuth();

  const resolveReport = async (reportId: string, action: 'resolved' | 'dismissed') => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: action,
        resolvedAt: serverTimestamp(),
        resolvedBy: user?.email
      });

      toast({
        title: `Report ${action}`,
        description: `The report has been marked as ${action}.`,
      });
    } catch (error) {
      console.error('Error resolving report:', error);
      toast({
        title: "Error",
        description: "Failed to update report status.",
        variant: "destructive",
      });
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      await deleteDoc(doc(db, 'reports', reportId));
      toast({
        title: "Report deleted",
        description: "The report has been permanently deleted.",
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report.",
        variant: "destructive",
      });
    }
  };

  return { resolveReport, deleteReport };
}
