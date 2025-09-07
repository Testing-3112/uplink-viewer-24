import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, LogOut, User, Play, Zap, Shield, Globe, ArrowDown, Settings, Shield as ShieldIcon } from "lucide-react";
import AdDisplay from "@/components/AdDisplay";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useUserTracking } from "@/hooks/useUserTracking";
import { AuthModal } from "@/components/AuthModal";
import UploadArea from "@/components/UploadArea";
import ParticlesBackground from "@/components/ParticlesBackground";
import { toast } from "@/hooks/use-toast";
import { saveCollection, Video } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

const HomePage = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const { user, logout } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Track user activity
  useUserTracking();

  const handleDataProcessed = async (data: string, suggestedTitle?: string, suggestedPoster?: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create portals.",
        variant: "destructive",
      });
      return;
    }

    console.log("Processing upload data:", data);
    
    // Auto-fill suggested values if not already set
    if (suggestedTitle && !folderName.trim()) {
      setFolderName(suggestedTitle);
    }
    if (suggestedPoster && !posterUrl.trim()) {
      setPosterUrl(suggestedPoster);
    }
    
    // Parse the data and generate videos with new structure
    const lines = data.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const videos: Video[] = [];
    
    for (let i = 0; i < lines.length; i += 5) {
      if (i + 4 < lines.length) {
        const video: Video = {
          id: lines[i],
          title: lines[i + 1],
          poster: lines[i + 2],
          download: lines[i + 3],
          watch: lines[i + 4]
        };
        videos.push(video);
        console.log("Parsed video:", video);
      }
    }

    if (videos.length === 0) {
      toast({
        title: "Invalid format",
        description: "No valid video data found. Please check your format:\n\nVideoID\nTitle\nPoster URL\nDownload Link\nEmbed Link\n\n(5 lines per video)",
        variant: "destructive",
      });
      return;
    }

    // Store data in Firebase with new structure
    const collectionData = {
      owner: user.uid,
      title: folderName.trim() || suggestedTitle || "My Collection",
      poster: posterUrl.trim() || suggestedPoster || videos[0]?.poster || "",
      videos
    };
    
    try {
      const collectionId = await saveCollection(collectionData);
      console.log(`Storing ${videos.length} videos with collection ID: ${collectionId}`);
      
      // Generate access URL
      const accessUrl = `${window.location.origin}/watch/${collectionId}`;
      
      // Copy to clipboard and open in new tab
      navigator.clipboard.writeText(accessUrl);
      toast({
        title: "Portal created successfully!",
        description: `${videos.length} videos added to "${collectionData.title}". URL copied to clipboard. Opening in new tab...`,
      });
      
      // Open in new tab
      window.open(accessUrl, '_blank');
      
      setShowUpload(false);
      setFolderName("");
      setPosterUrl("");
    } catch (error) {
      console.error("Error creating collection:", error);
      toast({
        title: "Error",
        description: "Failed to create collection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreatePortal = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowUpload(true);
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <ParticlesBackground />
      
      {/* Popunder Ad - Hidden but loads in background */}
      <AdDisplay slot="popupAd" triggerPopunder={true} className="hidden" />
      
      {/* Social Bar Ad - Hidden but loads in background */}
      <AdDisplay slot="socialBar" className="hidden" />

      {/* Header Banner Ad */}
      <div className="w-full flex justify-center py-2 bg-slate-800/30">
        <AdDisplay slot="headerBanner" className="max-w-4xl w-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-2 md:p-4">
        <div className="flex flex-row justify-between items-center gap-3 sm:gap-4 max-w-6xl mx-auto">
          <div className="flex-shrink-0">
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Nexaverse
            </h2>
          </div>
          
          {user ? (
            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
              {isAdmin && (
                <Button
                  onClick={() => navigate('/admin')}
                  variant="outline"
                  size="sm"
                  className="text-red-400 border-red-400 hover:bg-red-400/10 text-xs px-2 py-1 h-7 sm:h-8 sm:px-3 sm:text-sm"
                >
                  <ShieldIcon className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">Admin</span>
                  <span className="xs:hidden">A</span>
                </Button>
              )}
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="sm"
                className="text-slate-300 border-slate-600 hover:bg-slate-800 text-xs px-2 py-1 h-7 sm:h-8 sm:px-3 sm:text-sm"
              >
                <Settings className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">Dashboard</span>
                <span className="xs:hidden">Dash</span>
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="text-slate-300 border-slate-600 hover:bg-slate-800 text-xs px-2 py-1 h-7 sm:h-8 sm:px-3 sm:text-sm"
              >
                <LogOut className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">Sign Out</span>
                <span className="xs:hidden">Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex-shrink-0">
              <Button
                onClick={() => setShowAuthModal(true)}
                variant="outline"
                size="sm"
                className="text-slate-300 border-slate-600 hover:bg-slate-800 text-xs px-2 py-1 h-7 sm:h-8 sm:px-3 sm:text-sm"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </header>
      
      {/* Hero Section */}
      <main className="relative z-10">
        <section className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-6 md:space-y-8 max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight px-4">
              Welcome to Nexaverse
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed px-4">
              The ultimate platform for creating beautiful video collections. 
              Transform your content into stunning, shareable galleries that captivate your audience.
            </p>
            
            <div className="space-y-4 md:space-y-6 px-4">
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
                <Button
                  onClick={handleCreatePortal}
                  size={isMobile ? "default" : "lg"}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold shadow-xl hover-scale transition-all duration-300 w-full sm:w-auto"
                >
                  <Upload className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Create Now
                </Button>
                
                <Button
                  onClick={scrollToFeatures}
                  variant="outline"
                  size={isMobile ? "default" : "lg"}
                  className="text-slate-300 border-slate-600 hover:bg-slate-800 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg w-full sm:w-auto"
                >
                  Learn More
                  <ArrowDown className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {!user && (
                <p className="text-xs md:text-sm text-slate-400 animate-fade-in px-4" style={{animationDelay: '0.5s'}}>
                  Join thousands of creators building amazing video experiences
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16 animate-fade-in">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 md:mb-6">
                Why Choose Nexaverse?
              </h2>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
                Everything you need to create, organize, and share your video content with style and security.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-slate-700 hover-scale transition-all duration-300 animate-fade-in">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 md:mb-6">
                  <Play className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">Beautiful Galleries</h3>
                <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                  Create stunning video galleries with professional layouts. Your content deserves to look amazing.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-slate-700 hover-scale transition-all duration-300 animate-fade-in" style={{animationDelay: '0.1s'}}>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4 md:mb-6">
                  <Zap className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">Lightning Fast</h3>
                <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                  Optimized for speed with external video hosting. Your galleries load instantly, every time.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-slate-700 hover-scale transition-all duration-300 animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 md:mb-6">
                  <Globe className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">Easy Sharing</h3>
                <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                  Share your collections with anyone through beautiful, public links. No barriers, just content.
                </p>
              </div>

              {/* Sidebar Ad placement */}
              <div className="flex justify-center items-start">
                <AdDisplay slot="directLink" className="w-full max-w-[300px]" />
              </div>
            </div>


            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700 text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">Ready to Transform Your Content?</h3>
              <p className="text-slate-300 text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
                Join creators who are already building amazing video experiences with Nexaverse.
              </p>
              <Button
                onClick={handleCreatePortal}
                size={isMobile ? "default" : "lg"}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 md:px-12 py-3 md:py-4 text-base md:text-lg font-semibold shadow-xl hover-scale"
              >
                <Upload className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Create Now
              </Button>
            </div>
          </div>
        </section>

        {/* Native Ad Section */}
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <AdDisplay slot="nativeAd" className="w-full" />
          </div>
        </section>

      </main>

      {/* Footer Banner Ad */}
      <footer className="w-full flex justify-center py-4 bg-slate-800/30 border-t border-slate-700">
        <AdDisplay slot="footerBanner" className="max-w-4xl w-full" />
      </footer>

      {/* Upload Modal - Fixed scrolling issue */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="mx-2 sm:mx-4 sm:max-w-3xl max-h-[90vh] w-[calc(100vw-1rem)] sm:w-full flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="text-lg md:text-xl">Create New Content</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="space-y-4 md:space-y-6 pb-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="folderName" className="text-sm md:text-base">
                  Collection Title
                </Label>
                <Input
                  id="folderName"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g., My Awesome Videos, Travel Collection..."
                  className="mt-1 text-sm md:text-base"
                />
              </div>
              
              <div>
                <Label htmlFor="posterUrl" className="text-sm md:text-base">
                  Collection Poster URL (Optional)
                </Label>
                <Input
                  id="posterUrl"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://example.com/poster.jpg"
                  className="mt-1 text-sm md:text-base"
                />
              </div>
              
              <UploadArea 
                onDataProcessed={handleDataProcessed}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default HomePage;
