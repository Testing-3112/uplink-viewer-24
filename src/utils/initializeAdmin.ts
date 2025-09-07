
import { collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

const ADMIN_EMAIL = 'warzoneplayerg2@gmail.com';

export const initializeAdmin = async () => {
  try {
    console.log("🔧 Initializing admin for:", ADMIN_EMAIL);
    
    // Check if admin document already exists in the admins collection
    const adminsRef = collection(db, 'admins');
    const q = query(adminsRef, where('email', '==', ADMIN_EMAIL));
    const existingDocs = await getDocs(q);
    
    if (!existingDocs.empty) {
      console.log("✅ Admin document already exists:", existingDocs.docs[0].data());
      return;
    }
    
    // Create a new admin document
    const newAdminRef = doc(adminsRef);
    const adminData = {
      email: ADMIN_EMAIL,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: ['all'],
      active: true,
      name: 'Admin User'
    };
    
    await setDoc(newAdminRef, adminData);
    console.log('✅ Admin initialized successfully:', adminData);
    
    // Verify the document was created
    const verifyQuery = query(adminsRef, where('email', '==', ADMIN_EMAIL));
    const verifyDocs = await getDocs(verifyQuery);
    
    if (!verifyDocs.empty) {
      console.log("✅ Admin document verified:", verifyDocs.docs[0].data());
    } else {
      console.error("❌ Failed to verify admin document creation");
    }
    
  } catch (error) {
    console.error('❌ Error initializing admin:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
  }
};

// Force admin initialization with retry mechanism
export const forceInitializeAdmin = async () => {
  console.log("🔄 Force initializing admin...");
  let retries = 3;
  
  while (retries > 0) {
    try {
      await initializeAdmin();
      break;
    } catch (error) {
      console.error(`❌ Admin initialization failed, retries left: ${retries - 1}`, error);
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      }
    }
  }
};

// Auto-initialize admin on app start with improved error handling
setTimeout(() => {
  forceInitializeAdmin();
}, 1000); // Delay to ensure Firebase is initialized
