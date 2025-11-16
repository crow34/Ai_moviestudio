import React from 'react';
import { GeneratedImage } from '../types';
import DownloadIcon from './icons/DownloadIcon';

interface ImageGalleryProps {
  title: string;
  images: GeneratedImage[];
  maxItems?: number;
  selectedIds?: string[];
  onSelect?: (image: GeneratedImage) => void;
  isSelectable?: boolean;
  allowExport?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ title, images, maxItems = 4, selectedIds, onSelect, isSelectable = false, allowExport = false }) => {
  const slots = Array.from({ length: maxItems });

  const handleDownload = (e: React.MouseEvent, image: GeneratedImage) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${image.base64}`;
    const safeName = image.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = image.name ? `character-${safeName}.jpeg` : `scene-${image.id}.jpeg`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4 text-slate-200">{title} ({images.length}/{maxItems})</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {slots.map((_, index) => {
          const image = images[index];
          const isSelected = image && selectedIds?.includes(image.id);

          return (
            <div
              key={index}
              onClick={() => image && onSelect?.(image)}
              className={`group relative aspect-square rounded-xl overflow-hidden flex items-center justify-center transition-all
                ${isSelectable ? 'cursor-pointer hover:ring-blue-500' : ''}
                ${isSelected ? 'ring-4 ring-blue-500' : 'ring-2 ring-transparent'}
                ${image ? 'bg-zinc-800' : 'bg-zinc-950/50 border-2 border-dashed border-zinc-800'}`
              }
            >
              {image ? (
                <>
                  <img
                    src={`data:image/jpeg;base64,${image.base64}`}
                    alt={image.prompt}
                    title={image.prompt}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {image.name && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center p-1 truncate backdrop-blur-sm">
                        {image.name}
                    </div>
                  )}
                  {allowExport && (
                    <button
                      onClick={(e) => handleDownload(e, image)}
                      className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-blue-600 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
                      title={image.name ? 'Save Character Image' : 'Save Scene Image'}
                      aria-label={image.name ? 'Save Character Image' : 'Save Scene Image'}
                    >
                      <DownloadIcon className="w-5 h-5" />
                    </button>
                  )}
                </>
              ) : (
                <span className="text-zinc-500 text-xs text-center">Empty Slot</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageGallery;