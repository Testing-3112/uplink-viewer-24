
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './useAuth';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log("🔐 Checking admin status...");
      console.log("User object:", user);
      console.log("User email:", user?.email);
      console.log("Auth loading:", authLoading);

      if (!user) {
        console.log("❌ No user found, setting admin to false");
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (!user.email) {
        console.log("❌ User has no email, setting admin to false");
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Temporary admin bypass for specific email while Firestore rules are configured
      const ADMIN_EMAIL = 'warzoneplayerg2@gmail.com';
      if (user.email === ADMIN_EMAIL) {
        console.log("✅ Admin access granted for:", user.email);
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      try {
        console.log("🔍 Checking admins collection for email:", user.email);
        
        // Query the admins collection for a document with matching email
        const adminsRef = collection(db, 'admins');
        const q = query(adminsRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);
        
        console.log("📄 Query snapshot size:", querySnapshot.size);
        
        if (!querySnapshot.empty) {
          // Check if admin is active
          const adminDoc = querySnapshot.docs[0];
          const adminData = adminDoc.data();
          console.log("✅ Admin document data:", adminData);
          
          // Check if admin is active (default to true if not specified)
          const isActive = adminData.active !== false;
          console.log("👤 Admin active status:", isActive);
          
          setIsAdmin(isActive);
        } else {
          console.log("❌ No admin document found for this email");
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('❌ Error checking admin status, falling back to email check:', error);
        // Fallback: check if user email matches admin email
        if (user.email === ADMIN_EMAIL) {
          console.log("✅ Fallback admin access granted for:", user.email);
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  console.log("🔐 useAdmin hook state:", { isAdmin, loading, authLoading });

  return { isAdmin, loading: loading || authLoading };
}
