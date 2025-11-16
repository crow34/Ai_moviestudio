import React, { useState, useRef } from 'react';
import { GeneratedImage, AspectRatio } from '../types';
import { IMAGEN_ASPECT_RATIOS } from '../constants';
import ImageIcon from './icons/ImageIcon';
import Spinner from './Spinner';
import ImageGallery from './ImageGallery';
import PaintBrushIcon from './icons/PaintBrushIcon';
import SceneCreatorFromCamera from './SceneCreatorFromCamera';
import SceneCreatorFromUpload from './SceneCreatorFromUpload';

interface SceneStudioProps {
  scenes: GeneratedImage[];
  onGenerate: (prompt: string, aspectRatio: AspectRatio) => void;
  onAddScene: (base64: string, prompt: string) => void;
  onImport: (scenes: GeneratedImage[]) => void;
  isLoading: boolean;
}

const SceneStudio: React.FC<SceneStudioProps> = ({ scenes, onGenerate, onAddScene, onImport, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const canGenerate = scenes.length < 8;
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = () => {
    if (prompt.trim() && canGenerate) {
      onGenerate(prompt, aspectRatio);
      setPrompt('');
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scenes, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "comic-scenes.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const importedScenes = JSON.parse(content);
            onImport(importedScenes);
          }
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          alert("Could not import scenes. The file may be corrupt or in the wrong format.");
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    }
  };

  const triggerImport = () => {
    importInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
      <SceneCreatorFromUpload onAddScene={onAddScene} />
      <SceneCreatorFromCamera onAddScene={onAddScene} />
      <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold">Scene Generator (from Text)</h2>
        </div>
        <div className="flex items-center gap-2 bg-zinc-800/50 p-3 rounded-lg text-sm text-slate-400">
          <PaintBrushIcon className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <span>The art style selected in the header will be applied to your scene.</span>
        </div>
        <p className="text-slate-400 text-sm">Create a background scene for your comic. Generate up to 8 scenes to use in the Scene Editor.</p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A futuristic city on Mars, towering skyscrapers, two suns in the sky"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
          rows={3}
          disabled={isLoading || !canGenerate}
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="scene-aspect-ratio" className="block text-sm font-medium text-slate-400 mb-1">Aspect Ratio</label>
            <select
              id="scene-aspect-ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              disabled={isLoading || !canGenerate}
            >
              {IMAGEN_ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim() || !canGenerate}
            className="flex-1 self-end bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg px-4 py-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
          >
            {isLoading ? <Spinner /> : 'Generate Scene'}
          </button>
        </div>
         {!canGenerate && <p className="text-center text-yellow-400 text-sm">Scene library is full. Go to the Scene Editor to use them.</p>}
      </div>
      <ImageGallery title="Scene Library" images={scenes} maxItems={8} allowExport />

      <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Library Management</h3>
            <p className="text-sm text-slate-400">Save your scene library to a file or load an existing one.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handleExport} disabled={scenes.length === 0} className="bg-zinc-800 text-white font-semibold rounded-lg px-4 py-2 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors">Export</button>
            <button onClick={triggerImport} className="bg-zinc-800 text-white font-semibold rounded-lg px-4 py-2 hover:bg-zinc-700 transition-colors">Import</button>
            <input type="file" ref={importInputRef} onChange={handleImport} accept=".json" className="hidden" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneStudio;