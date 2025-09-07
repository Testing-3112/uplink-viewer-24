import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import VideoCard from "@/components/VideoCard";
import { SelectableVideoCard } from "@/components/SelectableVideoCard";
import { MassActionBar } from "@/components/MassActionBar";
import AdDisplay from "@/components/AdDisplay";
import RobustAdLoader from "@/components/RobustAdLoader";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, AlertTriangle, Edit, ChevronDown, ExternalLink, Copy, Share2, Check, Maximize, Minimize, CheckSquare, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getCollection, Video, Collection, saveCollection } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const WatchPage = () => {
  const { portalId } = useParams<{ portalId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portalData, setPortalData] = useState<Collection | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editPoster, setEditPoster] = useState("");
  const [editVideosText, setEditVideosText] = useState("");
  const [videoKey, setVideoKey] = useState(0);
  const [displayedVideosCount, setDisplayedVideosCount] = useState(12);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const folderId = searchParams.get("folder");
  const accessKey = searchParams.get("key");
  const videoId = searchParams.get("v");

  // Handle fullscreen changes with better browser compatibility
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      console.log("🖥️ Fullscreen state changed:", isCurrentlyFullscreen);
    };

    // Add listeners for all browsers
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Improved fullscreen toggle function with better browser support
  const toggleFullscreen = async () => {
    if (!videoContainerRef.current) {
      console.error("❌ Video container ref not available");
      return;
    }

    try {
      console.log("🖥️ Toggling fullscreen...");
      const element = videoContainerRef.current;
      
      // Check if currently in fullscreen
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isCurrentlyFullscreen) {
        // Enter fullscreen with browser compatibility
        console.log("📺 Entering fullscreen mode");
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).mozRequestFullScreen) {
          await (element as any).mozRequestFullScreen();
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen();
        } else {
          console.error("❌ Fullscreen API not supported");
          toast({
            title: "Fullscreen not supported",
            description: "Your browser doesn't support fullscreen mode.",
            variant: "destructive",
          });
        }
      } else {
        // Exit fullscreen with browser compatibility
        console.log("🔙 Exiting fullscreen mode");
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('❌ Error toggling fullscreen:', error);
      toast({
        title: "Fullscreen error",
        description: "Unable to toggle fullscreen mode. Please try using F11 or your browser's fullscreen option.",
        variant: "destructive",
      });
    }
  };

  // Infinite scroll for recommendations
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      setDisplayedVideosCount(prev => Math.min(prev + 12, videos.length));
    }
  }, [videos.length]);

  useEffect(() => {
    const scrollElement = scrollContainerRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);


  // Improved video parsing function with better error handling
  const parseVideosFromText = (text: string): Video[] => {
    console.log("=== PARSING VIDEOS ===");
    console.log("Input text length:", text?.length || 0);
    console.log("Input text preview:", text?.substring(0, 200) + "...");
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.error("❌ Empty or invalid text provided for parsing");
      return [];
    }

    // Clean and split the text
    const lines = text.trim().split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    console.log("📋 Lines after processing:", lines.length);
    console.log("📋 First few lines:", lines.slice(0, 10));
    
    const videos: Video[] = [];
    
    // Process every 5 lines as one video
    for (let i = 0; i < lines.length; i += 5) {
      console.log(`🔄 Processing video ${Math.floor(i/5) + 1} starting at line ${i}`);
      
      if (i + 4 < lines.length) {
        const videoData = {
          id: lines[i] || `video_${Math.floor(i/5) + 1}`,
          title: lines[i + 1] || `Video ${Math.floor(i/5) + 1}`,
          poster: lines[i + 2] || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200",
          download: lines[i + 3] || "#",
          watch: lines[i + 4] || ""
        };
        
        // Validate video data
        if (!videoData.title || videoData.title === '') {
          console.warn("⚠️ Video has empty title, skipping:", videoData);
          continue;
        }
        
        videos.push(videoData);
        console.log("✅ Successfully parsed video:", {
          id: videoData.id,
          title: videoData.title,
          hasPoster: !!videoData.poster,
          hasDownload: !!videoData.download,
          hasWatch: !!videoData.watch
        });
      } else {
        console.warn(`⚠️ Incomplete video data at line ${i} (need 5 lines per video), available lines: ${lines.length - i}`);
        
        // If we have at least 2 lines (id and title), create a basic video
        if (i + 1 < lines.length && lines[i + 1]) {
          const basicVideo: Video = {
            id: lines[i] || `video_${Math.floor(i/5) + 1}`,
            title: lines[i + 1],
            poster: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200",
            download: "#",
            watch: ""
          };
          videos.push(basicVideo);
          console.log("✅ Created basic video from incomplete data:", basicVideo);
        }
      }
    }
    
    console.log("📊 PARSING COMPLETE - Total videos parsed:", videos.length);
    return videos;
  };

  useEffect(() => {
    const loadPortalData = async () => {
      console.log("=== LOADING PORTAL DATA ===");
      console.log("WatchPage params:", { portalId, folderId, accessKey, videoId });
      console.log("User:", user?.uid || "No user");
      
      setLoading(true);
      setError(null);
      setVideos([]);
      setCurrentVideo(null);

      if (folderId) {
        // Folder-based access - generate sample data
        console.log("🗂️ Loading folder-based data for:", folderId);
        const sampleVideos: Video[] = [
          {
            id: `${folderId}_video1`,
            title: `Video 1 from ${folderId}`,
            poster: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200",
            download: "https://example.com/download1",
            watch: "https://www.youtube.com/embed/dQw4w9WgXcQ"
          },
          {
            id: `${folderId}_video2`, 
            title: `Video 2 from ${folderId}`,
            poster: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200",
            download: "https://example.com/download2",
            watch: "https://www.youtube.com/embed/dQw4w9WgXcQ"
          }
        ];

        setVideos(sampleVideos);
        setPortalData({
          videos: sampleVideos,
          title: `Folder: ${folderId}`,
          owner: "Unknown",
          poster: "",
          createdAt: new Date()
        });

        // Set current video if videoId is provided
        if (videoId) {
          const selectedVideo = sampleVideos.find(v => v.id === videoId);
          if (selectedVideo) {
            setCurrentVideo(selectedVideo);
          }
        }

        console.log("✅ Folder data loaded:", sampleVideos.length, "videos");
        setLoading(false);
        return;
      }

      if (!portalId) {
        console.error("❌ No portal ID or folder ID provided");
        setError("Invalid URL: Please provide either a collection ID or folder parameter");
        setLoading(false);
        return;
      }

      try {
        console.log("🔥 Loading from Firebase with ID:", portalId);
        const firebaseData = await getCollection(portalId);
        
        if (!firebaseData) {
          console.error("❌ Collection not found in Firebase");
          setError("Collection not found. The link may be invalid or the collection may have been deleted.");
          setLoading(false);
          return;
        }

        console.log("✅ Firebase data loaded successfully");
        console.log("📋 Collection details:", {
          id: firebaseData.id,
          title: firebaseData.title,
          owner: firebaseData.owner,
          videosType: typeof firebaseData.videos,
          videosLength: Array.isArray(firebaseData.videos) ? firebaseData.videos.length : 'N/A'
        });
        
        // Process videos data with improved error handling
        let processedVideos: Video[] = [];
        
        if (Array.isArray(firebaseData.videos)) {
          console.log("📺 Videos data is array format");
          processedVideos = firebaseData.videos.filter(video => 
            video && typeof video === 'object' && video.title
          );
          console.log("✅ Filtered valid videos:", processedVideos.length);
        } else if (typeof firebaseData.videos === 'string' && firebaseData.videos.trim()) {
          console.log("📝 Videos data is string format, parsing...");
          processedVideos = parseVideosFromText(firebaseData.videos);
        } else {
          console.error("❌ Invalid videos data format:", typeof firebaseData.videos);
          setError("This collection has invalid video data format. Please check the collection or contact support.");
          setLoading(false);
          return;
        }
        
        if (processedVideos.length === 0) {
          console.error("❌ No valid videos found after processing");
          setError("This collection appears to be empty or contains invalid video data. Please add videos or check the data format.");
          setLoading(false);
          return;
        }

        // Validate each video
        const validVideos = processedVideos.filter((video, index) => {
          const isValid = video && video.id && video.title;
          if (!isValid) {
            console.warn(`⚠️ Invalid video at index ${index}:`, video);
          }
          return isValid;
        });

        if (validVideos.length === 0) {
          console.error("❌ No valid videos after validation");
          setError("All videos in this collection have invalid data. Please check the video information.");
          setLoading(false);
          return;
        }

        console.log("🎬 Final video validation:");
        validVideos.forEach((video, index) => {
          console.log(`Video ${index + 1}:`, {
            id: video.id,
            title: video.title?.substring(0, 30) + "...",
            hasPoster: !!video.poster,
            hasDownload: !!video.download,
            hasWatch: !!video.watch
          });
        });

        // Set state
        setVideos(validVideos);
        setPortalData(firebaseData);
        setEditTitle(firebaseData.title || "");
        setEditPoster(firebaseData.poster || "");
        
        // Set current video if videoId is provided
        if (videoId) {
          const selectedVideo = validVideos.find(v => v.id === videoId);
          if (selectedVideo) {
            setCurrentVideo(selectedVideo);
          }
        }
        
        // Convert videos to text format for editing
        const videosText = validVideos.map(video => 
          `${video.id}\n${video.title}\n${video.poster}\n${video.download}\n${video.watch}`
        ).join('\n\n');
        setEditVideosText(videosText);
        
        console.log("🎉 Collection loaded successfully:", {
          title: firebaseData.title,
          videoCount: validVideos.length,
          owner: firebaseData.owner
        });
        
      } catch (err) {
        console.error("❌ Error loading collection:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(`Failed to load collection: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadPortalData();
  }, [portalId, folderId, accessKey, videoId, user]);

  const handleEditSubmit = async () => {
    if (!user || !portalData || !portalData.id) return;

    const videos = parseVideosFromText(editVideosText);

    if (videos.length === 0) {
      toast({
        title: "Invalid format",
        description: "Please ensure each video has 5 lines: VideoID, Title, Poster URL, Download Link, Embed Link",
        variant: "destructive",
      });
      return;
    }

    const updatedCollection = {
      owner: portalData.owner,
      title: editTitle.trim() || "My Collection",
      poster: editPoster.trim() || videos[0]?.poster || "",
      videos
    };
    
    try {
      await saveCollection(updatedCollection, portalData.id);
      setPortalData({ ...updatedCollection, id: portalData.id, createdAt: portalData.createdAt });
      setVideos(videos);
      
      toast({
        title: "Collection updated!",
        description: `${videos.length} videos updated in "${updatedCollection.title}".`,
      });
      
      setShowEditDialog(false);
    } catch (error) {
      console.error("Error updating collection:", error);
      toast({
        title: "Error",
        description: "Failed to update collection",
        variant: "destructive",
      });
    }
  };

  const getRecommendations = (currentVideoId: string): Video[] => {
    if (!currentVideo) return [];
    
    const sameFolderVideos = videos.filter(v => 
      v.id !== currentVideoId && 
      v.id.startsWith(currentVideo.id.split('_')[0] || '')
    );
    
    if (sameFolderVideos.length > 0) {
      return sameFolderVideos;
    }
    
    return videos.filter(v => v.id !== currentVideoId);
  };

  const handleVideoSwitch = (video: Video) => {
    console.log("🔄 Switching to video:", video.id, video.title);
    setCurrentVideo(video);
    // Update URL with video ID
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('v', video.id);
    setSearchParams(newSearchParams);
    // Force iframe to re-render by updating key
    setVideoKey(prev => prev + 1);
    // Reset displayed videos count
    setDisplayedVideosCount(12);
  };

  const handleVideoCardClick = (video: Video) => {
    // Update URL to include video ID and navigate
    const currentSearchParams = new URLSearchParams(searchParams);
    currentSearchParams.set('v', video.id);
    navigate(`/watch/${portalId}?${currentSearchParams.toString()}`);
  };

  const handleCopyUrl = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setCopiedUrl(true);
      toast({
        title: "URL Copied!",
        description: "Video URL has been copied to clipboard.",
      });
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast({
        title: "Failed to copy URL",
        description: "Please copy the URL manually from the address bar.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: currentVideo?.title || 'Video',
      text: `Watch: ${currentVideo?.title || 'Video'}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy URL
        await handleCopyUrl();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to copy URL
      await handleCopyUrl();
    }
  };

  // Selection functions
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedVideos(new Set());
  };

  const handleVideoSelect = (videoId: string, selected: boolean) => {
    const newSelection = new Set(selectedVideos);
    if (selected) {
      newSelection.add(videoId);
    } else {
      newSelection.delete(videoId);
    }
    setSelectedVideos(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedVideos.size === videos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(videos.map(v => v.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedVideos(new Set());
  };

  const handleMassDelete = () => {
    if (!user || !portalData || !portalData.id) return;

    const remainingVideos = videos.filter(video => !selectedVideos.has(video.id));
    
    const videosText = remainingVideos.map(video => 
      `${video.id}\n${video.title}\n${video.poster}\n${video.download}\n${video.watch}`
    ).join('\n\n');

    const updatedCollection = {
      owner: portalData.owner,
      title: portalData.title,
      poster: portalData.poster,
      videos: remainingVideos
    };

    saveCollection(updatedCollection, portalData.id)
      .then(() => {
        setVideos(remainingVideos);
        setSelectedVideos(new Set());
        setSelectionMode(false);
        toast({
          title: "Videos deleted",
          description: `${selectedVideos.size} video${selectedVideos.size > 1 ? 's' : ''} deleted successfully.`,
        });
      })
      .catch((error) => {
        console.error("Error deleting videos:", error);
        toast({
          title: "Error",
          description: "Failed to delete videos",
          variant: "destructive",
        });
      });
  };

  const handleCopyVideoUrl = (video: Video) => {
    const videoUrl = `${window.location.origin}/watch/${portalId}?v=${video.id}`;
    navigator.clipboard.writeText(videoUrl);
    toast({
      title: "URL Copied!",
      description: "Video URL has been copied to clipboard.",
    });
  };

  const handleDeleteSingleVideo = (video: Video) => {
    if (!user || !portalData || !portalData.id) return;

    const remainingVideos = videos.filter(v => v.id !== video.id);
    
    const updatedCollection = {
      owner: portalData.owner,
      title: portalData.title,
      poster: portalData.poster,
      videos: remainingVideos
    };

    saveCollection(updatedCollection, portalData.id)
      .then(() => {
        setVideos(remainingVideos);
        toast({
          title: "Video deleted",
          description: `"${video.title}" has been deleted.`,
        });
      })
      .catch((error) => {
        console.error("Error deleting video:", error);
        toast({
          title: "Error",
          description: "Failed to delete video",
          variant: "destructive",
        });
      });
  };

  const canEdit = user && portalData && portalData.owner === user.uid;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading collection...</p>
          <p className="text-sm text-muted-foreground mt-2">Portal ID: {portalId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center space-y-4 max-w-md">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">Error Loading Collection</h2>
          <p className="text-muted-foreground">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => navigate("/")} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (videos.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center space-y-4 max-w-md">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto" />
          <h2 className="text-2xl font-bold">No Videos Found</h2>
          <p className="text-muted-foreground">
            This collection appears to be empty. Please add some videos or check the collection data.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => navigate("/")} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            {canEdit && (
              <Button variant="outline" onClick={() => setShowEditDialog(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Add Videos
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (!currentVideo) {
    // Grid view - show all videos
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              
              {canEdit && (
                <div className="flex gap-2">
                  <Button 
                    variant={selectionMode ? "secondary" : "outline"}
                    onClick={toggleSelectionMode}
                  >
                    {selectionMode ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                    {selectionMode ? "Exit Select" : "Select Videos"}
                  </Button>
                  
                  {selectionMode && videos.length > 0 && (
                    <Button 
                      variant="outline"
                      onClick={handleSelectAll}
                      size="sm"
                    >
                      {selectedVideos.size === videos.length ? "Deselect All" : "Select All"}
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {portalData?.title || "Video Collection"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {videos.length} video{videos.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {/* Banner Ad for Grid View */}
          <div className="mb-8 flex justify-center">
            <RobustAdLoader slot="headerBanner" className="w-full max-w-3xl mx-auto" />
          </div>

          {/* YouTube-style video grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
            {videos.map((video, index) => (
              <div key={video.id || `video-${index}`} className="group">
                {selectionMode ? (
                  <SelectableVideoCard
                    video={video}
                    isSelected={selectedVideos.has(video.id)}
                    onSelect={(selected) => handleVideoSelect(video.id, selected)}
                    onCopyUrl={() => handleCopyVideoUrl(video)}
                    onDelete={() => handleDeleteSingleVideo(video)}
                    onPlay={() => handleVideoCardClick(video)}
                    selectionMode={selectionMode}
                  />
                ) : (
                  <VideoCard
                    id={video.id || `video-${index}`}
                    title={video.title}
                    poster={video.poster}
                    onClick={() => handleVideoCardClick(video)}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Mass Action Bar */}
          {selectionMode && (
            <MassActionBar
              selectedCount={selectedVideos.size}
              onClearSelection={handleClearSelection}
              onMassDelete={handleMassDelete}
              onMoveToCollection={() => {}} // Not needed for this use case
              collections={[]} // Not needed for this use case
              type="videos"
            />
          )}
        </div>
      </div>
    );
  }

  // Video player view with unified layout (player on top, recommendations below)
  const recommendations = getRecommendations(currentVideo.id);
  const visibleRecommendations = recommendations.slice(0, displayedVideosCount);

  return (
    <div className={`min-h-screen bg-background ${isFullscreen ? 'overflow-hidden' : ''}`}>
      <div className={`${isMobile ? 'px-2 py-2' : 'container mx-auto px-4 py-6'} max-w-screen-2xl`}>
        {!isFullscreen && (
          <Button 
            variant="ghost" 
            onClick={() => {
              setCurrentVideo(null);
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete('v');
              setSearchParams(newSearchParams);
            }}
            className={`mb-4 ${isMobile ? 'mb-2' : 'mb-6'}`}
            size={isMobile ? "sm" : "default"}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Videos
          </Button>
        )}

        {/* Top Banner/Mobile Ad - Responsive */}
        {!isFullscreen && (
          <div className={`${isMobile ? 'mb-3' : 'mb-6'} flex justify-center`}>
            <RobustAdLoader 
              slot={isMobile ? "banner320x50" : "headerBanner"} 
              className={`w-full ${isMobile ? 'max-w-[320px]' : 'max-w-4xl'} mx-auto`} 
            />
          </div>
        )}

        {/* Video Player - Responsive with better mobile optimization */}
        <div className={`w-full flex-shrink-0 space-y-3 ${isMobile ? 'mb-4' : 'mb-8'}`}>
          <div 
            ref={videoContainerRef}
            className={`${isMobile ? 'aspect-video' : 'aspect-video'} w-full bg-black rounded-lg overflow-hidden relative ${
              isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
            }`}
          >
            {currentVideo.watch ? (
              <iframe
                key={videoKey}
                src={currentVideo.watch}
                className="w-full h-full"
                allowFullScreen
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <p className={isMobile ? 'text-sm' : 'text-base'}>No video URL available</p>
              </div>
            )}
            
            {/* Improved fullscreen button - Better mobile positioning */}
            <Button
              onClick={toggleFullscreen}
              variant="secondary"
              size={isMobile ? "icon" : "sm"}
              className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} bg-black/70 hover:bg-black/90 text-white border-0 backdrop-blur-sm z-10 transition-all duration-200`}
              title={isFullscreen ? "Exit Fullscreen (ESC)" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} /> : <Maximize className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />}
            </Button>
          </div>

          {!isFullscreen && (
            <div className={`space-y-3 ${isMobile ? 'px-1' : ''}`}>
              <h1 className={`${isMobile ? 'text-lg leading-tight' : 'text-2xl'} font-bold`}>
                <span className="line-clamp-3 break-words hyphens-auto" title={currentVideo.title}>
                  {currentVideo.title}
                </span>
              </h1>
              
              <div className={`flex flex-wrap gap-2 ${isMobile ? 'gap-2' : 'gap-4'}`}>
                {currentVideo.download && currentVideo.download !== "#" && (
                  <Button
                    onClick={() => window.open(currentVideo.download, '_blank')}
                    className="gap-2 bg-gradient-primary hover:opacity-90 text-white border-0 flex-1 sm:flex-none"
                    size={isMobile ? "sm" : "default"}
                  >
                    <Download className="w-4 h-4" />
                    {isMobile ? "Download" : "Download Video"}
                  </Button>
                )}
                
                <Button
                  onClick={handleCopyUrl}
                  variant="outline"
                  className="gap-2 flex-1 sm:flex-none"
                  size={isMobile ? "sm" : "default"}
                >
                  {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedUrl ? "Copied!" : "Copy URL"}
                </Button>
                
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="gap-2 flex-1 sm:flex-none"
                  size={isMobile ? "sm" : "default"}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Side Ad (300x250) - Only on larger screens and when not fullscreen */}
        {!isFullscreen && !isMobile && (
          <div className="mb-8 flex justify-center">
            <RobustAdLoader slot="directLink" className="w-full max-w-[300px] mx-auto" />
          </div>
        )}

        {/* Mobile Banner Ad - Only on mobile */}
        {!isFullscreen && isMobile && (
          <div className="mb-4 flex justify-center">
            <RobustAdLoader slot="banner320x50" className="w-full max-w-[320px] mx-auto" />
          </div>
        )}

        {/* Recommendations Grid - Below player */}
        {!isFullscreen && (
          <div className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>
                {recommendations.length > 0 ? "Recommended Videos" : "No more videos"}
              </h3>
            </div>
            
            <div 
              ref={scrollContainerRef}
              className="w-full"
            >
              {/* Grid of recommended videos - Improved mobile layout */}
              <div className={`grid gap-3 ${
                isMobile 
                  ? 'grid-cols-2' 
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'
              }`}>
                {visibleRecommendations.map((video, index) => (
                  <div key={video.id} className="group">
                    <VideoCard
                      id={video.id}
                      title={video.title}
                      poster={video.poster}
                      onClick={() => handleVideoSwitch(video)}
                    />
                  </div>
                ))}
              </div>

              {/* Show more button when there are more videos */}
              {displayedVideosCount < recommendations.length && (
                <div className="flex justify-center py-8">
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    onClick={() => setDisplayedVideosCount(prev => Math.min(prev + 12, recommendations.length))}
                    className="gap-2"
                  >
                    Show More Videos
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Container Ad - Only show when not fullscreen */}
        {!isFullscreen && (
          <div className="mt-12 flex justify-center">
            <RobustAdLoader slot="nativeAd" className="w-full max-w-4xl mx-auto" />
          </div>
        )}

        {/* Footer Banner Ad - Only show when not fullscreen */}
        {!isFullscreen && (
          <div className="mt-8 flex justify-center">
            <RobustAdLoader slot="footerBanner" className="w-full max-w-4xl mx-auto" />
          </div>
        )}

        {/* Footer with legal links - Only show when not fullscreen */}
        {!isFullscreen && (
          <footer className="mt-12 border-t pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <button onClick={() => navigate("/legal/no-copyright")} className="hover:text-primary flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  No Copyright
                </button>
                <button onClick={() => navigate("/legal/legal-videos")} className="hover:text-primary flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Legal Videos
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2024 Video Portal. All rights reserved.
              </p>
            </div>
          </footer>
        )}
      </div>

      {/* Popunder Ad - Always present and triggers every time */}
      <RobustAdLoader slot="popupAd" />
      
      {/* Social Bar Ad - Always present and triggers every time */}
      <RobustAdLoader slot="socialBar" />
    </div>
  );
};

export default WatchPage;
