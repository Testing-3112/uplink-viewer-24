
import React, { useEffect } from 'react';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './useAuth';
import { useQuery } from '@tanstack/react-query';

export function useUserTracking() {
  const { user } = useAuth();

  useEffect(() => {
    const trackUser = async () => {
      if (!user) return;

      try {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          lastActive: serverTimestamp(),
          createdAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error('Error tracking user:', error);
      }
    };

    trackUser();
    
    // Update every 5 minutes
    const interval = setInterval(trackUser, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);
}

export function useUserAnalytics() {
  return useQuery({
    queryKey: ['userAnalytics'],
    queryFn: async () => {
      const usersRef = collection(db, 'users');
      
      // Get total users only
      const totalUsersQuery = query(usersRef);
      const totalUsersSnapshot = await getDocs(totalUsersQuery);
      const totalUsers = totalUsersSnapshot.size;

      return {
        totalUsers
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchInterval: 2 * 60 * 1000 // Refetch every 2 minutes
  });
}
