import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

const EXAMPLE_AD_CODES = {
  footerBanner: `<script type="text/javascript">
	atOptions = {
		'key' : 'YOUR_FOOTER_BANNER_KEY',
		'format' : 'iframe',
		'height' : 90,
		'width' : 728,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//abdicateeffectlucky.com/YOUR_FOOTER_BANNER_KEY/invoke.js"></script>`,

  directLink: `<script type="text/javascript">
	atOptions = {
		'key' : 'YOUR_DIRECT_LINK_KEY',
		'format' : 'iframe',
		'height' : 250,
		'width' : 300,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//abdicateeffectlucky.com/YOUR_DIRECT_LINK_KEY/invoke.js"></script>`,

  nativeAd: `<script type="text/javascript">
	atOptions = {
		'key' : 'YOUR_NATIVE_AD_KEY',
		'format' : 'iframe',
		'height' : 120,
		'width' : 600,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//abdicateeffectlucky.com/YOUR_NATIVE_AD_KEY/invoke.js"></script>`,

  headerBanner: `<script type="text/javascript">
	atOptions = {
		'key' : 'YOUR_HEADER_BANNER_KEY',
		'format' : 'iframe',
		'height' : 90,
		'width' : 728,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//abdicateeffectlucky.com/YOUR_HEADER_BANNER_KEY/invoke.js"></script>`,

  popupAd: `<script async="async" data-cfasync="false" src="//abdicateeffectlucky.com/YOUR_POPUP_KEY/invoke.js"></script>
<div id="container-YOUR_POPUP_KEY"></div>`
};

export async function initializeDynamicAdSettings() {
  try {
    console.log('🔧 Initializing dynamic ad settings...');
    
    const docRef = doc(db, 'adSettings', 'main');
    
    const adData = {
      ...EXAMPLE_AD_CODES,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      notes: 'Replace the example keys with your actual Adsterra ad keys'
    };
    
    console.log('📝 Writing dynamic ad data to Firestore...', Object.keys(adData));
    
    await setDoc(docRef, adData, { merge: true });

    console.log('✅ Dynamic ad settings initialized successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Error initializing dynamic ad settings:', error);
    return false;
  }
}