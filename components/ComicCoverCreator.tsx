import React, { useState } from 'react';
import { GeneratedImage, AspectRatio } from '../types';
import { IMAGEN_ASPECT_RATIOS, COMIC_GENRES } from '../constants';
import ImageGallery from './ImageGallery';
import BookOpenIcon from './icons/BookOpenIcon';
import Spinner from './Spinner';
import SparkleIcon from './icons/SparkleIcon';
import DownloadIcon from './icons/DownloadIcon';

interface ComicCoverCreatorProps {
  characters: GeneratedImage[];
  scenes: GeneratedImage[];
  onGenerate: (
    background: GeneratedImage,
    characters: GeneratedImage[],
    title: string,
    subtitle: string,
    author: string,
    aspectRatio: AspectRatio,
    genre: string
  ) => void;
  isLoading: boolean;
  coverImage: GeneratedImage | null;
}

const ComicCoverCreator: React.FC<ComicCoverCreatorProps> = ({
  characters,
  scenes,
  onGenerate,
  isLoading,
  coverImage,
}) => {
  const [selectedScene, setSelectedScene] = useState<GeneratedImage | null>(null);
  const [selectedCharacters, setSelectedCharacters] = useState<GeneratedImage[]>([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Action');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');

  const canGenerate = selectedScene && title.trim();

  const handleToggleCharacterSelection = (character: GeneratedImage) => {
    setSelectedCharacters(prev => {
      const isSelected = prev.some(c => c.id === character.id);
      if (isSelected) {
        return prev.filter(c => c.id !== character.id);
      } else {
        if (prev.length < 2) { // Limit to 2 characters for a cover
            return [...prev, character];
        }
        alert("You can select up to 2 characters for a cover.");
        return prev;
      }
    });
  };
  
  const handleGenerate = () => {
    if (canGenerate) {
      onGenerate(selectedScene!, selectedCharacters, title, subtitle, author, aspectRatio, genre);
    }
  };

  const handleDownload = () => {
    if (!coverImage) return;
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${coverImage.base64}`;
    link.download = `comic-cover-${Date.now()}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const aspectRatioClasses: Record<AspectRatio, string> = {
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16]',
    '4:3': 'aspect-[4/3]',
    '3:4': 'aspect-[3/4]',
    '21:9': 'aspect-[21/9]',
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="space-y-8">
        <ImageGallery
          title="1. Select a Background Scene"
          images={scenes}
          selectedIds={selectedScene ? [selectedScene.id] : []}
          onSelect={setSelectedScene}
          isSelectable
          maxItems={8}
        />
        <ImageGallery
          title="2. Select Characters (Optional, max 2)"
          images={characters}
          selectedIds={selectedCharacters.map(c => c.id)}
          onSelect={handleToggleCharacterSelection}
          isSelectable
        />
      </div>

      <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6 flex flex-col gap-4 h-full sticky top-24">
        <div className="flex items-center gap-3">
          <BookOpenIcon className="w-8 h-8 text-blue-400" />
          <h2 className="text-2xl font-semibold">3. Comic Cover Details</h2>
        </div>
        <div className="flex items-center gap-2 bg-zinc-800/50 p-3 rounded-lg text-sm text-slate-400">
          <SparkleIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <span>Using Gemini 2.5 Flash Image to generate the cover art.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <label htmlFor="cover-title" className="block text-sm font-medium text-slate-400 mb-1">Title <span className="text-red-400">*</span></label>
                <input id="cover-title" type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g., The Last Stardrift"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={isLoading} />
            </div>
            <div>
                <label htmlFor="cover-subtitle" className="block text-sm font-medium text-slate-400 mb-1">Subtitle / Tagline (Optional)</label>
                <input id="cover-subtitle" type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)}
                    placeholder="e.g., A Galaxy in Peril"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={isLoading} />
            </div>
             <div>
                <label htmlFor="cover-author" className="block text-sm font-medium text-slate-400 mb-1">Author Name(s) (Optional)</label>
                <input id="cover-author" type="text" value={author} onChange={e => setAuthor(e.target.value)}
                    placeholder="e.g., By AI Studio"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={isLoading} />
            </div>
            <div>
                 <label htmlFor="cover-genre" className="block text-sm font-medium text-slate-400 mb-1">Genre (for Font Style)</label>
                <select
                    id="cover-genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={isLoading}
                >
                    {COMIC_GENRES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="cover-aspect-ratio" className="block text-sm font-medium text-slate-400 mb-1">Aspect Ratio</label>
                <select
                    id="cover-aspect-ratio"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={isLoading}
                >
                    {IMAGEN_ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                </select>
            </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isLoading || !canGenerate}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg px-4 py-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 mt-auto"
        >
          {isLoading ? <Spinner /> : 'Generate Comic Cover'}
        </button>

        <div className={`relative ${aspectRatioClasses[aspectRatio]} w-full bg-zinc-950 rounded-lg mt-2 flex items-center justify-center overflow-hidden border border-zinc-700`}>
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Spinner />
              <span>Forging your cover...</span>
            </div>
          ) : coverImage ? (
            <>
              <img src={`data:image/jpeg;base64,${coverImage.base64}`} alt={coverImage.prompt} className="w-full h-full object-contain" />
              <button
                onClick={handleDownload}
                className="absolute bottom-3 right-3 bg-blue-600/80 text-white p-2 rounded-full hover:bg-blue-600 transition-colors backdrop-blur-sm"
                title="Save Cover Image"
                aria-label="Save Cover Image"
              >
                <DownloadIcon className="w-5 h-5" />
              </button>
            </>
          ) : (
            <p className="text-slate-500 p-4 text-center">Your comic book cover will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComicCoverCreator;