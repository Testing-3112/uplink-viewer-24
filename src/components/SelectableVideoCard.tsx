
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, Copy, Trash2, Plus } from 'lucide-react';
import { Video, Collection } from '@/lib/firebase';

interface SelectableVideoCardProps {
  video: Video | Collection;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onCopyUrl: () => void;
  onDelete: () => void;
  onPlay: () => void;
  selectionMode: boolean;
  onAddVideos?: () => void; // New prop for adding videos to collections
  isCollection?: boolean; // New prop to distinguish collections from single videos
}

export function SelectableVideoCard({
  video,
  isSelected,
  onSelect,
  onCopyUrl,
  onDelete,
  onPlay,
  selectionMode,
  onAddVideos,
  isCollection = false
}: SelectableVideoCardProps) {
  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="p-0 relative">
        {selectionMode && (
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="bg-white border-2 border-slate-400"
            />
          </div>
        )}
        <div 
          className="relative aspect-video overflow-hidden rounded-t-lg cursor-pointer"
          onClick={selectionMode ? () => onSelect(!isSelected) : onPlay}
        >
          <img
            src={video.poster || "/placeholder.svg"}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          {!selectionMode && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-8 h-8 text-white" fill="currentColor" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-4">
        <CardTitle className="text-sm md:text-base line-clamp-2 mb-3">
          {video.title}
        </CardTitle>
        {!selectionMode && (
          <div className="flex gap-2">
            <Button
              onClick={onCopyUrl}
              size="sm"
              className="flex-1 text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy URL
            </Button>
            {isCollection && onAddVideos && (
              <Button
                onClick={onAddVideos}
                size="sm"
                variant="outline"
                className="text-xs"
                title="Add more videos to this collection"
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
            <Button
              onClick={onDelete}
              size="sm"
              variant="destructive"
              className="text-xs"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
