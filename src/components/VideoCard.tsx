import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";

interface VideoCardProps {
  id: string;
  title: string;
  poster: string;
  duration?: string;
  onClick: () => void;
}

const VideoCard = ({ id, title, poster, duration, onClick }: VideoCardProps) => {
  return (
    <Card 
      className="video-card cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden rounded-t-lg">
        <img
          src={poster}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-glow">
            <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {duration}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
    </Card>
  );
};

export default VideoCard;