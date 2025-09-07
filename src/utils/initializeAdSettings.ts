import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Current ad codes that are being used on the website
const CURRENT_AD_CODES = {
  // Banner 300x250 (Sidebar)
  banner300x250: `<script type="text/javascript">
	atOptions = {
		'key' : 'edbc0e88c4099d02175e1e3b024d8538',
		'format' : 'iframe',
		'height' : 250,
		'width' : 300,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//abdicateeffectlucky.com/edbc0e88c4099d02175e1e3b024d8538/invoke.js"></script>`,

  // Banner 728x90 (Header Banner)
  banner728x90: `<script type="text/javascript">
	atOptions = {
		'key' : 'b903fa845297e51d387c03016df6531e',
		'format' : 'iframe',
		'height' : 90,
		'width' : 728,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//abdicateeffectlucky.com/b903fa845297e51d387c03016df6531e/invoke.js"></script>`,

  // Banner 320x50 (Mobile Banner)  
  banner320x50: `<script type="text/javascript">
	atOptions = {
		'key' : '4a98ba6a6da16d9081d6e12cca3a3743',
		'format' : 'iframe',
		'height' : 50,
		'width' : 320,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//abdicateeffectlucky.com/4a98ba6a6da16d9081d6e12cca3a3743/invoke.js"></script>`,

  // Popunder
  popunder: `<script type='text/javascript' src='//abdicateeffectlucky.com/7b/c3/27/7bc3271a7d97b8e5bf2c6a3a9d670106.js'></script>`,

  // Social Bar
  socialBar: `<script type='text/javascript' src='//abdicateeffectlucky.com/bd/b0/34/bdb034c6bbb6dcb7f08c2c9a63f57a9f.js'></script>`,

  // Native Banner
  nativeBanner: `<script async="async" data-cfasync="false" src="//abdicateeffectlucky.com/cd61435395a70ff02c61db7e95d4252b/invoke.js"></script>
<div id="container-cd61435395a70ff02c61db7e95d4252b"></div>`
};

export async function initializeAdSettings() {
  try {
    console.log('🔧 Initializing ad settings...');
    
    const docRef = doc(db, 'settings', 'ads');
    
    // Create the document with proper error handling
    const adData = {
      ...CURRENT_AD_CODES,
      enabled: true,
      updatedAt: serverTimestamp(),
      updatedBy: 'warzoneplayerg2@gmail.com',
      createdAt: serverTimestamp()
    };
    
    console.log('📝 Writing ad data to Firestore...', Object.keys(adData));
    
    await setDoc(docRef, adData, { merge: true });

    console.log('✅ Ad settings initialized successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Error initializing ad settings:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    
    // Provide more specific error feedback
    if (error?.code === 'permission-denied') {
      console.error('🚫 Permission denied - Check Firestore security rules');
    }
    
    return false;
  }
}