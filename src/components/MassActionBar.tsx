
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, FolderPlus, X } from 'lucide-react';

interface MassActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onMassDelete: () => void;
  onMoveToCollection: (collectionId: string) => void;
  collections: Array<{ id: string; title: string }>;
  type: 'collections' | 'videos';
}

export function MassActionBar({ 
  selectedCount, 
  onClearSelection, 
  onMassDelete, 
  onMoveToCollection, 
  collections,
  type 
}: MassActionBarProps) {
  const [selectedCollection, setSelectedCollection] = React.useState<string>('');

  const handleMoveToCollection = () => {
    if (selectedCollection) {
      onMoveToCollection(selectedCollection);
      setSelectedCollection('');
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-lg p-4 flex items-center gap-4">
        <div className="text-white font-medium">
          {selectedCount} {type === 'collections' ? 'collection' : 'video'}{selectedCount > 1 ? 's' : ''} selected
        </div>
        
        <div className="flex items-center gap-2">
          {type === 'videos' && collections.length > 0 && (
            <>
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Move to collection..." />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleMoveToCollection}
                disabled={!selectedCollection}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Move
              </Button>
            </>
          )}
          
          <Button
            onClick={onMassDelete}
            size="sm"
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          
          <Button
            onClick={onClearSelection}
            size="sm"
            variant="ghost"
            className="text-slate-300 hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
