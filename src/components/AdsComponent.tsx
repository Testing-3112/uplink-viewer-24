import React from 'react';

interface AdsComponentProps {
  className?: string;
  position?: 'banner300x250' | 'banner728x90' | 'banner320x50' | 'popunder' | 'socialBar' | 'nativeBanner' | 'inline';
}

export const AdsComponent: React.FC<AdsComponentProps> = ({ 
  className = "", 
  position = "inline" 
}) => {
  // You can easily modify ads here by changing these configurations
  const adConfigs = {
    banner300x250: {
      width: "300px",
      height: "250px",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      content: "Advertisement Space - Sidebar Banner",
    },
    banner728x90: {
      width: "100%",
      height: "90px",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      content: "Advertisement Space - Header Banner",
    },
    banner320x50: {
      width: "320px",
      height: "50px",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      content: "Advertisement Space - Mobile Banner",
    },
    popunder: {
      width: "100%",
      height: "0px",
      backgroundColor: "transparent",
      content: "",
    },
    socialBar: {
      width: "100%",
      height: "0px",
      backgroundColor: "transparent",
      content: "",
    },
    nativeBanner: {
      width: "100%",
      height: "120px",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      content: "Advertisement Space - Native Banner",
    },
    inline: {
      width: "100%",
      height: "120px",
      backgroundColor: "rgba(255, 255, 255, 0.1)", 
      content: "Advertisement Space - Inline Content",
    }
  };

  const currentAd = adConfigs[position];

  return (
    <div 
      className={`border border-slate-600 rounded-lg flex items-center justify-center text-slate-400 text-sm ${className}`}
      style={{
        width: currentAd.width,
        height: currentAd.height,
        backgroundColor: currentAd.backgroundColor,
      }}
    >
      {/* Replace this with your actual ad code */}
      <div className="text-center">
        <p>{currentAd.content}</p>
        <p className="text-xs mt-1 opacity-60">Replace with your ad script</p>
      </div>
    </div>
  );
};

export default AdsComponent;