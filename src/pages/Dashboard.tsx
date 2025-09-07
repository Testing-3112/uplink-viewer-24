import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, ArrowLeft, Copy, ExternalLink, Trash2, Play, Film } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { getUserCollections, deleteCollection, saveCollection, Video, Collection } from "@/lib/firebase";
import UploadArea from "@/components/UploadArea";
import { useIsMobile } from "@/hooks/use-mobile";
import { MassActionBar } from "@/components/MassActionBar";
import { SelectableVideoCard } from "@/components/SelectableVideoCard";


const Dashboard = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [singleVideos, setSingleVideos] = useState<Collection[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'collection' | 'single' | null>(null);
  const [folderName, setFolderName] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [loading, setLoading] = useState(true);
  
  // New state for mass operations
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    const filtered = singleVideos.filter(video => 
      video.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredVideos(filtered);
  }, [searchQuery, singleVideos]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const collectionsData = await getUserCollections(user.uid);
      
      // Separate collections and single videos
      const regularCollections = collectionsData.filter(c => !c.isSingleVideo);
      const singleVideosCollections = collectionsData.filter(c => c.isSingleVideo);
      
      setCollections(regularCollections);
      setSingleVideos(singleVideosCollections);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load your content.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async (id: string, type: 'collection' | 'single') => {
    const url = `${window.location.origin}/watch/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL Copied!",
        description: "Link copied to clipboard successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this collection?")) return;
    
    try {
      await deleteCollection(id);
      setCollections(collections.filter(c => c.id !== id));
      toast({
        title: "Success",
        description: "Collection deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete collection.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSingleVideo = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    
    try {
      await deleteCollection(id);
      setSingleVideos(singleVideos.filter(v => v.id !== id));
      toast({
        title: "Success",
        description: "Video deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video.",
        variant: "destructive",
      });
    }
  };

  const handleDataProcessed = async (data: string, suggestedTitle?: string, suggestedPoster?: string) => {
    if (!user) return;

    console.log("Processing upload data:", data);
    
    // Auto-fill suggested values if not already set
    if (suggestedTitle && !folderName.trim()) {
      setFolderName(suggestedTitle);
    }
    if (suggestedPoster && !posterUrl.trim()) {
      setPosterUrl(suggestedPoster);
    }
    
    const lines = data.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (createType === 'single') {
      // Handle single videos
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
        }
      }

      if (videos.length === 0) {
        toast({
          title: "Invalid format",
          description: "No valid video data found.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Save all videos as individual collections with isSingleVideo flag
        await Promise.all(videos.map(video => 
          saveCollection({
            owner: user.uid,
            title: video.title,
            poster: video.poster,
            videos: [video],
            isSingleVideo: true
          })
        ));

        toast({
          title: "Videos uploaded successfully!",
          description: `${videos.length} video(s) added to Single Videos.`,
        });

        setShowCreateModal(false);
        setCreateType(null);
        loadData();
      } catch (error) {
        console.error("Error saving single videos:", error);
        toast({
          title: "Error",
          description: "Failed to save videos. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Handle collection
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
        }
      }

      if (videos.length === 0) {
        toast({
          title: "Invalid format",
          description: "No valid video data found.",
          variant: "destructive",
        });
        return;
      }

      const collectionData = {
        owner: user.uid,
        title: folderName.trim() || suggestedTitle || "My Collection",
        poster: posterUrl.trim() || suggestedPoster || videos[0]?.poster || "",
        videos
      };
      
      try {
        const collectionId = await saveCollection(collectionData);
        
        const accessUrl = `${window.location.origin}/watch/${collectionId}`;
        navigator.clipboard.writeText(accessUrl);
        
        toast({
          title: "Collection created successfully!",
          description: `${videos.length} videos added. URL copied to clipboard.`,
        });
        
        window.open(accessUrl, '_blank');
        
        setShowCreateModal(false);
        setCreateType(null);
        setFolderName("");
        setPosterUrl("");
        loadData();
      } catch (error) {
        console.error("Error creating collection:", error);
        toast({
          title: "Error",
          description: "Failed to create collection. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const openVideo = (id: string) => {
    const url = `/watch/${id}`;
    window.open(url, '_blank');
  };

  const handleToggleSelection = (id: string, type: 'collection' | 'video') => {
    if (type === 'collection') {
      const newSelected = new Set(selectedCollections);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelectedCollections(newSelected);
    } else {
      const newSelected = new Set(selectedVideos);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelectedVideos(newSelected);
    }
  };

  const handleClearSelection = () => {
    setSelectedCollections(new Set());
    setSelectedVideos(new Set());
    setSelectionMode(false);
  };

  const handleMassDelete = async (type: 'collection' | 'video') => {
    const selectedIds = type === 'collection' ? selectedCollections : selectedVideos;
    const itemType = type === 'collection' ? 'collections' : 'videos';
    
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} ${itemType}?`)) return;
    
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteCollection(id)));
      
      if (type === 'collection') {
        setCollections(collections.filter(c => !selectedIds.has(c.id!)));
      } else {
        setSingleVideos(singleVideos.filter(v => !selectedIds.has(v.id!)));
      }
      
      handleClearSelection();
      
      toast({
        title: "Success",
        description: `${selectedIds.size} ${itemType} deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${itemType}.`,
        variant: "destructive",
      });
    }
  };

  const handleMoveToCollection = async (targetCollectionId: string) => {
    // This would require additional backend logic to merge videos into existing collections
    toast({
      title: "Feature Coming Soon",
      description: "Move to collection functionality will be available soon.",
    });
    handleClearSelection();
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header - Fixed positioning with proper mobile layout */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center justify-between p-3 md:p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size={isMobile ? "sm" : "default"}
              className="text-slate-300 hover:text-white hover:bg-slate-800 shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {isMobile ? "Home" : "Back to Home"}
            </Button>
          </div>
          
          <div className="flex-1 flex justify-center">
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => setSelectionMode(!selectionMode)}
              variant={selectionMode ? "default" : "outline"}
              size={isMobile ? "sm" : "default"}
              className={selectionMode ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" : "border-blue-400 text-blue-400 hover:bg-blue-400/10"}
            >
              {selectionMode ? "Exit Select" : "Select"}
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              size={isMobile ? "sm" : "default"}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create New
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-3 md:p-6 max-w-7xl mx-auto pt-6">
        
        <Tabs defaultValue="collections" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="collections" className="text-xs md:text-sm">Collections</TabsTrigger>
            <TabsTrigger value="single-videos" className="text-xs md:text-sm">Single Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="collections">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-slate-400">Loading collections...</div>
              </div>
            ) : collections.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent className="pt-6">
                  <div className="text-slate-400 mb-4">No collections found</div>
                  <Button onClick={() => setShowCreateModal(true)}>
                    Create Your First Collection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {collections.map((collection) => (
                  <SelectableVideoCard
                    key={collection.id}
                    video={collection}
                    isSelected={selectedCollections.has(collection.id!)}
                    onSelect={(selected) => handleToggleSelection(collection.id!, 'collection')}
                    onCopyUrl={() => handleCopyUrl(collection.id!, 'collection')}
                    onDelete={() => handleDeleteCollection(collection.id!)}
                    onPlay={() => navigate(`/watch/${collection.id}`)}
                    selectionMode={selectionMode}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="single-videos">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search single videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="text-slate-400">Loading videos...</div>
              </div>
            ) : filteredVideos.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent className="pt-6">
                  <div className="text-slate-400 mb-4">
                    {searchQuery ? "No videos found matching your search" : "No single videos found"}
                  </div>
                  {!searchQuery && (
                    <Button onClick={() => setShowCreateModal(true)}>
                      Upload Your First Video
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredVideos.map((video) => (
                  <SelectableVideoCard
                    key={video.id}
                    video={video}
                    isSelected={selectedVideos.has(video.id!)}
                    onSelect={(selected) => handleToggleSelection(video.id!, 'video')}
                    onCopyUrl={() => handleCopyUrl(video.id!, 'single')}
                    onDelete={() => handleDeleteSingleVideo(video.id!)}
                    onPlay={() => navigate(`/watch/${video.id}`)}
                    selectionMode={selectionMode}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Mass Action Bar */}
      <MassActionBar
        selectedCount={selectedCollections.size}
        onClearSelection={handleClearSelection}
        onMassDelete={() => handleMassDelete('collection')}
        onMoveToCollection={handleMoveToCollection}
        collections={collections.map(c => ({ id: c.id!, title: c.title }))}
        type="collections"
      />
      
      <MassActionBar
        selectedCount={selectedVideos.size}
        onClearSelection={handleClearSelection}
        onMassDelete={() => handleMassDelete('video')}
        onMoveToCollection={handleMoveToCollection}
        collections={collections.map(c => ({ id: c.id!, title: c.title }))}
        type="videos"
      />

      {/* Create Modal - Fixed scrolling */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="mx-2 sm:mx-4 sm:max-w-3xl max-h-[90vh] w-[calc(100vw-1rem)] sm:w-full flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="text-lg md:text-xl">Create New Content</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-1">
            {!createType ? (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card 
                    className="cursor-pointer hover:bg-accent transition-colors p-6"
                    onClick={() => setCreateType('collection')}
                  >
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Film className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Collection</h3>
                        <p className="text-sm text-muted-foreground">Create a collection of multiple videos</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:bg-accent transition-colors p-6"
                    onClick={() => setCreateType('single')}
                  >
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Single Video(s)</h3>
                        <p className="text-sm text-muted-foreground">Upload individual videos</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button 
                    onClick={() => setCreateType(null)} 
                    variant="ghost" 
                    size="sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <h3 className="font-semibold">
                    {createType === 'collection' ? 'Create Collection' : 'Upload Single Video(s)'}
                  </h3>
                </div>
                
                {createType === 'collection' && (
                  <>
                    <div>
                      <Label htmlFor="folderName" className="text-sm md:text-base">
                        Collection Title
                      </Label>
                      <Input
                        id="folderName"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        placeholder="e.g., My Awesome Videos, Travel Collection..."
                        className="mt-1"
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
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
                
                <UploadArea onDataProcessed={handleDataProcessed} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
