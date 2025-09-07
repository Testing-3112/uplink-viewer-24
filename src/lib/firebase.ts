import { collection, doc, getDoc, setDoc, query, where, getDocs, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface Video {
  id: string;
  title: string;
  poster: string;
  watch: string;
  download: string;
}

export interface Collection {
  id?: string;
  owner: string;
  title: string;
  poster: string;
  createdAt: any;
  videos: Video[] | string;
  isSingleVideo?: boolean; // New field to distinguish single videos from collections
}

// Collections are stored in the 'collections' collection in Firestore
const COLLECTIONS_COLLECTION = 'collections';

export const saveCollection = async (collectionData: Omit<Collection, 'id' | 'createdAt'>, existingId?: string): Promise<string> => {
  try {
    console.log("saveCollection called with:", { collectionData, existingId });
    
    // Handle both array and string videos
    if (Array.isArray(collectionData.videos)) {
      console.log("Videos count:", collectionData.videos.length);
      console.log("First video:", collectionData.videos[0]);
    } else {
      console.log("Videos data (string):", typeof collectionData.videos === 'string' ? collectionData.videos.substring(0, 100) + "..." : collectionData.videos);
    }
    
    if (existingId) {
      // Update existing collection
      const docRef = doc(db, COLLECTIONS_COLLECTION, existingId);
      await updateDoc(docRef, {
        ...collectionData,
        updatedAt: serverTimestamp()
      });
      console.log("Updated existing collection:", existingId);
      return existingId;
    } else {
      // Create new collection
      const docRef = doc(collection(db, COLLECTIONS_COLLECTION));
      const collectionWithTimestamp = { 
        ...collectionData, 
        id: docRef.id,
        createdAt: serverTimestamp()
      };
      await setDoc(docRef, collectionWithTimestamp);
      console.log("Created new collection:", docRef.id);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving collection to Firebase:', error);
    throw error;
  }
};

export const getCollection = async (id: string): Promise<Collection | null> => {
  try {
    console.log("getCollection called with ID:", id);
    const docRef = doc(db, COLLECTIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as Collection;
      console.log("Collection found:", data);
      
      // Handle both array and string videos for logging
      if (Array.isArray(data.videos)) {
        console.log("Videos in collection (array):", data.videos.length);
        if (data.videos.length > 0) {
          console.log("First video from Firebase:", data.videos[0]);
        }
      } else if (typeof data.videos === 'string') {
        console.log("Videos in collection (string):", data.videos.length, "characters");
        console.log("Videos preview:", data.videos.substring(0, 100) + "...");
      } else {
        console.log("Videos data type:", typeof data.videos);
        console.log("Videos value:", data.videos);
      }
      
      return data;
    } else {
      console.log("Collection document does not exist");
      return null;
    }
  } catch (error) {
    console.error('Error fetching collection from Firebase:', error);
    throw error;
  }
};

export const getUserCollections = async (userUid: string): Promise<Collection[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS_COLLECTION),
      where('owner', '==', userUid)
    );
    const querySnapshot = await getDocs(q);
    
    const collections: Collection[] = [];
    querySnapshot.forEach((doc) => {
      collections.push(doc.data() as Collection);
    });
    
    // Sort by creation date (newest first)
    collections.sort((a, b) => {
      const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return bTime - aTime;
    });
    
    return collections;
  } catch (error) {
    console.error('Error fetching user collections from Firebase:', error);
    throw error;
  }
};

export const deleteCollection = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting collection from Firebase:', error);
    throw error;
  }
};
