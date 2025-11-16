import React, { useState } from 'react';
import { GeneratedImage, AspectRatio } from '../types';
import { ASPECT_RATIOS } from '../constants';
import ImageGallery from './ImageGallery';
import FireIcon from './icons/FireIcon';
import Spinner from './Spinner';
import SparkleIcon from './icons/SparkleIcon';
import DownloadIcon from './icons/DownloadIcon';

interface VFXStudioProps {
  characters: GeneratedImage[];
  scenes: GeneratedImage[];
  selectedCharacter: GeneratedImage | null;
  selectedScene: GeneratedImage | null;
  onSelectCharacter: (character: GeneratedImage | null) => void;
  onSelectScene: (scene: GeneratedImage | null) => void;
  onGenerate: (vfxInstructions: string, aspectRatio: AspectRatio) => void;
  isLoading: boolean;
  vfxPanel: GeneratedImage | null;
}

const VFXStudio: React.FC<VFXStudioProps> = ({
  characters,
  scenes,
  selectedCharacter,
  selectedScene,
  onSelectCharacter,
  onSelectScene,
  onGenerate,
  isLoading,
  vfxPanel,
}) => {
  const [vfxInstructions, setVfxInstructions] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

  const canGenerate = selectedCharacter && selectedScene && vfxInstructions.trim();

  const handleGenerate = () => {
    if (canGenerate) {
      onGenerate(vfxInstructions, aspectRatio);
    }
  };

  const handleDownload = () => {
    if (!vfxPanel) return;
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${vfxPanel.base64}`;
    link.download = `vfx-panel-${Date.now()}.jpeg`;
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
          title="1. Select a Character"
          images={characters}
          selectedIds={selectedCharacter ? [selectedCharacter.id] : []}
          onSelect={onSelectCharacter}
          isSelectable
        />
        <ImageGallery
          title="2. Select a Scene"
          images={scenes}
          selectedIds={selectedScene ? [selectedScene.id] : []}
          onSelect={onSelectScene}
          isSelectable
          maxItems={8}
        />
      </div>

      <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6 flex flex-col gap-4 h-full sticky top-24">
        <div className="flex items-center gap-3">
          <FireIcon className="w-6 h-6 text-orange-400" />
          <h2 className="text-xl font-semibold">3. Create VFX Panel</h2>
        </div>
        <div className="flex items-center gap-2 bg-zinc-800/50 p-3 rounded-lg text-sm text-slate-400">
          <SparkleIcon className="w-5 h-5 text-orange-400 flex-shrink-0" />
          <span>Using Gemini 2.5 Flash Image to generate dynamic effects.</span>
        </div>

        <textarea
          value={vfxInstructions}
          onChange={(e) => setVfxInstructions(e.target.value)}
          placeholder="Describe the VFX and the character's reaction. e.g., 'A huge fiery explosion erupts behind the character. The character should be diving away from the blast, with a shocked expression.'"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
          rows={5}
          disabled={isLoading || !selectedCharacter || !selectedScene}
        />
        
        <div>
            <label htmlFor="panel-size" className="block text-sm font-medium text-slate-400 mb-1">Panel Size</label>
            <select
                id="panel-size"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                disabled={isLoading || !selectedCharacter || !selectedScene}
            >
                {ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
            </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !canGenerate}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg px-4 py-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 mt-auto"
        >
          {isLoading ? <Spinner /> : 'Generate VFX Panel'}
        </button>

        <div className={`relative ${aspectRatioClasses[aspectRatio]} w-full bg-zinc-950 rounded-lg mt-2 flex items-center justify-center overflow-hidden border border-zinc-700`}>
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Spinner />
              <span>Generating Effects...</span>
            </div>
          ) : vfxPanel ? (
            <>
              <img src={`data:image/jpeg;base64,${vfxPanel.base64}`} alt={vfxPanel.prompt} className="w-full h-full object-contain" />
              <button
                onClick={handleDownload}
                className="absolute bottom-3 right-3 bg-blue-600/80 text-white p-2 rounded-full hover:bg-blue-600 transition-colors backdrop-blur-sm"
                title="Save VFX Panel"
                aria-label="Save VFX Panel"
              >
                <DownloadIcon className="w-5 h-5" />
              </button>
            </>
          ) : (
            <p className="text-slate-500 p-4 text-center">Your VFX panel will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VFXStudio;