import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface UploadAreaProps {
  onDataProcessed: (formattedData: string, suggestedTitle?: string, suggestedPoster?: string) => void;
}

const UploadArea = ({ onDataProcessed }: UploadAreaProps) => {
  const [textData, setTextData] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [pendingData, setPendingData] = useState<{
    formattedData: string;
    suggestedTitle?: string;
    suggestedPoster?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced parsing function to handle various input formats including JSON with thumbnail detection
  const formatVideoData = (rawText: string): { formattedData: string; suggestedTitle?: string; suggestedPoster?: string } => {
    console.log("🔧 Starting to format video data...");
    console.log("📝 Raw input length:", rawText.length);

    if (!rawText || rawText.trim().length === 0) {
      console.error("❌ Empty input provided");
      return { formattedData: "" };
    }

    // Remove BOM and normalize line endings
    let cleanedText = rawText
      .replace(/^\uFEFF/, '') // Remove BOM
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();

    console.log("🧹 Cleaned text length:", cleanedText.length);

    let suggestedTitle = "";
    let suggestedPoster = "";

    // Try to detect and parse JSON format first
    if (cleanedText.startsWith('[') || cleanedText.startsWith('{')) {
      console.log("🔍 Detected JSON format, attempting to parse...");
      try {
        let jsonData;
        
        // Handle single object or array of objects
        if (cleanedText.startsWith('{')) {
          jsonData = [JSON.parse(cleanedText)];
        } else {
          jsonData = JSON.parse(cleanedText);
        }

        if (Array.isArray(jsonData)) {
          console.log(`📊 Successfully parsed JSON with ${jsonData.length} video objects`);
          
          const formattedLines: string[] = [];
          
          // Extract collection-level suggestions from first valid video
          const firstVideoWithPoster = jsonData.find(video => 
            video.poster && video.poster.startsWith('http')
          );
          
          if (firstVideoWithPoster) {
            suggestedPoster = firstVideoWithPoster.poster;
            console.log("🖼️ Auto-detected poster from JSON:", suggestedPoster.substring(0, 50) + "...");
          }
          
          // Generate suggested title from video count and first title
          if (jsonData.length > 0) {
            const firstTitle = jsonData[0].title || "Videos";
            if (jsonData.length === 1) {
              suggestedTitle = firstTitle;
            } else {
              // Extract common pattern or use generic title
              const commonWords = firstTitle.split(/[\s\-_\.]/);
              if (commonWords.length > 1) {
                suggestedTitle = `${commonWords[0]} Collection (${jsonData.length} videos)`;
              } else {
                suggestedTitle = `Video Collection (${jsonData.length} videos)`;
              }
            }
            console.log("📝 Auto-generated title:", suggestedTitle);
          }
          
          jsonData.forEach((video, index) => {
            const videoCount = index + 1;
            console.log(`✅ Processing JSON video ${videoCount}:`, {
              id: video.id || `video_${videoCount}`,
              title: video.title || `Video ${videoCount}`,
              poster: video.poster?.substring(0, 30) + "..." || "default",
              download: video.download?.substring(0, 30) + "..." || "#",
              watch: video.watch?.substring(0, 30) + "..." || ""
            });

            // Extract and validate fields from JSON object
            const videoData = [
              video.id || `video_${videoCount}`, // ID
              video.title || `Video ${videoCount}`, // Title
              video.poster && video.poster.startsWith('http') ? video.poster : "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200", // Poster
              video.download || "#", // Download
              video.watch || "" // Watch URL
            ];

            formattedLines.push(...videoData);
          });

          // Join with proper formatting (5 lines per video, separated by empty lines)
          const result = [];
          for (let i = 0; i < formattedLines.length; i += 5) {
            const videoLines = formattedLines.slice(i, i + 5);
            result.push(videoLines.join('\n'));
          }

          const finalResult = result.join('\n\n');
          console.log(`🎉 JSON formatting complete! ${jsonData.length} videos processed`);
          return { 
            formattedData: finalResult,
            suggestedTitle,
            suggestedPoster
          };
        }
      } catch (error) {
        console.log("⚠️ JSON parsing failed, falling back to text parsing:", error);
        // Fall through to regular text parsing if JSON parsing fails
      }
    }

    // Original text parsing logic for non-JSON formats
    // Split into lines and clean each line
    let lines = cleanedText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    console.log("📋 Initial lines count:", lines.length);

    // Handle various separator formats
    let processedLines: string[] = [];

    for (const line of lines) {
      // Skip separator lines
      if (line.match(/^[-=_*#]{3,}$/)) {
        console.log("⏭️ Skipping separator line:", line);
        continue;
      }

      // Handle tab-separated, pipe-separated, semicolon-separated, or comma-separated values
      if (line.includes('\t') || line.includes('|') || line.includes(';') || 
          (line.includes(',') && line.split(',').length >= 4)) {
        
        let parts: string[];
        if (line.includes('\t')) {
          parts = line.split('\t');
          console.log("📑 Processing tab-separated line");
        } else if (line.includes('|')) {
          parts = line.split('|');
          console.log("📑 Processing pipe-separated line");
        } else if (line.includes(';')) {
          parts = line.split(';');
          console.log("📑 Processing semicolon-separated line");
        } else {
          parts = line.split(',');
          console.log("📑 Processing comma-separated line");
        }

        parts = parts.map(part => part.trim()).filter(part => part.length > 0);
        
        if (parts.length >= 2) {
          // Ensure we have 5 parts (pad with defaults if needed)
          while (parts.length < 5) {
            if (parts.length === 2) parts.push("https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200");
            else if (parts.length === 3) parts.push("#");
            else if (parts.length === 4) parts.push("");
          }
          processedLines.push(...parts.slice(0, 5));
          console.log(`✅ Added ${Math.min(parts.length, 5)} parts from separated line`);
        }
      } else {
        // Regular line
        processedLines.push(line);
      }
    }

    console.log("📊 Processed lines count:", processedLines.length);

    // Ensure we have complete sets of 5 lines per video
    const completeVideos = Math.floor(processedLines.length / 5);
    const validLines = processedLines.slice(0, completeVideos * 5);
    
    // Handle remaining incomplete data
    const remainingLines = processedLines.slice(completeVideos * 5);
    if (remainingLines.length >= 2) {
      console.log("🔧 Processing incomplete video data:", remainingLines.length, "remaining lines");
      
      // Pad incomplete video with defaults
      const paddedVideo = [...remainingLines];
      while (paddedVideo.length < 5) {
        if (paddedVideo.length === 2) paddedVideo.push("https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200");
        else if (paddedVideo.length === 3) paddedVideo.push("#");
        else if (paddedVideo.length === 4) paddedVideo.push("");
      }
      validLines.push(...paddedVideo);
    }

    if (validLines.length === 0) {
      console.error("❌ No valid video data found after processing");
      return { formattedData: "" };
    }

    // Format as 5-line groups separated by empty lines
    const videoGroups = [];
    for (let i = 0; i < validLines.length; i += 5) {
      const videoLines = validLines.slice(i, i + 5);
      videoGroups.push(videoLines.join('\n'));
    }

    const result = videoGroups.join('\n\n');
    const videoCount = Math.floor(validLines.length / 5);
    
    console.log(`🎉 Formatting complete! ${videoCount} videos processed`);
    console.log("📝 First video preview:", validLines.slice(0, 5));

    return { formattedData: result };
  };

  const handleTextChange = (text: string) => {
    setTextData(text);
    if (text.trim()) {
      const { formattedData, suggestedTitle, suggestedPoster } = formatVideoData(text);
      if (formattedData) {
        // Store the pending data instead of immediately processing
        setPendingData({ formattedData, suggestedTitle, suggestedPoster });
        
        // Show helpful toast with auto-detected info
        if (suggestedTitle || suggestedPoster) {
          toast({
            title: "Collection info detected! 🎉",
            description: `${suggestedTitle ? `Title: ${suggestedTitle.substring(0, 30)}...` : ''} ${suggestedPoster ? '| Poster detected' : ''}`,
          });
        }
      }
    } else {
      setPendingData(null);
    }
  };

  const handleConfirmUpload = () => {
    if (pendingData) {
      onDataProcessed(pendingData.formattedData, pendingData.suggestedTitle, pendingData.suggestedPoster);
      setPendingData(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.txt')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setTextData(content);
        const { formattedData, suggestedTitle, suggestedPoster } = formatVideoData(content);
        if (formattedData) {
          // Store as pending data instead of immediately processing
          setPendingData({ formattedData, suggestedTitle, suggestedPoster });
          toast({
            title: "File loaded! 📁",
            description: `Successfully formatted ${Math.floor(formattedData.split('\n\n').length)} videos${suggestedTitle ? ` | Title: ${suggestedTitle}` : ''}. Click 'Confirm Upload' to proceed.`,
          });
        }
      }
    };
    reader.readAsText(file);
  }, [onDataProcessed]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div 
          className={`border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer hover:border-primary/50 ${
            isDragging ? 'border-primary bg-primary/10' : 'border-border'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt"
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full">
              {isDragging ? (
                <Sparkles className="w-8 h-8 text-primary" />
              ) : (
                <Upload className="w-8 h-8 text-primary" />
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-foreground">
              Upload Your Video Data
            </h3>
            <p className="text-muted-foreground text-sm">
              Drag and drop a .txt file or click to browse. Supports JSON with auto-thumbnail detection!
            </p>
          </div>

          <div className="mt-6">
            <Button 
              variant="outline" 
              className="gap-2"
              type="button"
            >
              <FileText className="w-4 h-4" />
              Choose File
            </Button>
          </div>
        </div>
      </div>

      <Textarea
        placeholder="Paste your video data here - JSON format will auto-detect titles and thumbnails!"
        value={textData}
        onChange={(e) => handleTextChange(e.target.value)}
        className="min-h-[120px] max-h-[200px] bg-card border-border resize-none text-sm"
      />

      <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
        <strong className="text-foreground">Auto-formatting supports:</strong><br/>
        <div className="mt-2 space-y-1">
          <div>• <strong>JSON format:</strong> Auto-detects collection title and poster from video data</div>
          <div>• Tab, pipe (|), semicolon (;), or comma separated values</div>
          <div>• Line-by-line format (5 lines per video)</div>
          <div>• Mixed formats with separators (---, ===)</div>
          <div>• Incomplete data (automatically filled with defaults)</div>
        </div>
      </div>

      {pendingData && (
        <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-green-400 font-medium">Collection Ready! 🎉</p>
              <p className="text-sm text-green-300 mt-1">
                {Math.floor(pendingData.formattedData.split('\n\n').length)} videos formatted and ready to upload
              </p>
              {pendingData.suggestedTitle && (
                <p className="text-xs text-green-300 mt-1">
                  Title: {pendingData.suggestedTitle}
                </p>
              )}
            </div>
            <Button 
              onClick={handleConfirmUpload}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Confirm Upload
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadArea;
