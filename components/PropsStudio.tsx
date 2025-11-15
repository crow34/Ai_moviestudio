import React, { useState, useEffect } from 'react';
import { GeneratedImage } from '../types';
import ImageGallery from './ImageGallery';
import CubeIcon from './icons/CubeIcon';
import Spinner from './Spinner';
import SparkleIcon from './icons/SparkleIcon';

interface PropsStudioProps {
  scenes: GeneratedImage[];
  onAddProp: (scene: GeneratedImage, propInstructions: string) => void;
  onReplaceScene: (originalSceneId: string, newScene: GeneratedImage) => void;
  isLoading: boolean;
  propPanel: { originalSceneId: string; image: GeneratedImage } | null;
}

const PropsStudio: React.FC<PropsStudioProps> = ({
  scenes,
  onAddProp,
  onReplaceScene,
  isLoading,
  propPanel,
}) => {
  const [selectedScene, setSelectedScene] = useState<GeneratedImage | null>(null);
  const [propInstructions, setPropInstructions] = useState('');

  const canGenerate = selectedScene && propInstructions.trim();

  // When a new prop panel is generated, update the selected scene to match
  useEffect(() => {
    if (propPanel) {
        const originalScene = scenes.find(s => s.id === propPanel.originalSceneId);
        if(originalScene) {
            setSelectedScene(originalScene);
        }
    }
  }, [propPanel, scenes]);

  const handleGenerate = () => {
    if (canGenerate && selectedScene) {
      onAddProp(selectedScene, propInstructions);
    }
  };

  const handleReplace = () => {
    if (propPanel) {
      onReplaceScene(propPanel.originalSceneId, propPanel.image);
      setSelectedScene(null);
      setPropInstructions('');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="space-y-8">
        <ImageGallery
          title="1. Select a Scene to Modify"
          images={scenes}
          selectedIds={selectedScene ? [selectedScene.id] : []}
          onSelect={setSelectedScene}
          isSelectable
          maxItems={8}
        />
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 flex flex-col gap-4 h-full sticky top-24">
        <div className="flex items-center gap-3">
          <CubeIcon className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-semibold">2. Props Department</h2>
        </div>
        <div className="flex items-center gap-2 bg-slate-700/50 p-2 rounded-md text-sm text-slate-400">
          <SparkleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span>Using Gemini 2.5 Flash Image to add props to your scene.</span>
        </div>

        <textarea
          value={propInstructions}
          onChange={(e) => setPropInstructions(e.target.value)}
          placeholder="Describe the prop to add. e.g., 'A mysterious glowing orb on the table', 'A vintage red telephone on the desk'"
          className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
          rows={3}
          disabled={isLoading || !selectedScene}
        />
        
        <button
          onClick={handleGenerate}
          disabled={isLoading || !canGenerate}
          className="w-full bg-green-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? <Spinner /> : 'Add Prop to Scene'}
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-2">
                <h3 className="text-center font-semibold text-slate-400">Original Scene</h3>
                <div className="aspect-square bg-slate-900 rounded-md flex items-center justify-center overflow-hidden border border-slate-700">
                    {selectedScene ? (
                        <img src={`data:image/jpeg;base64,${selectedScene.base64}`} alt="Original Scene" className="w-full h-full object-contain" />
                    ) : (
                         <p className="text-slate-500 p-4 text-center">Select a scene from the library.</p>
                    )}
                </div>
            </div>
             <div className="flex flex-col gap-2">
                <h3 className="text-center font-semibold text-slate-400">New Scene with Prop</h3>
                <div className="aspect-square bg-slate-900 rounded-md flex items-center justify-center overflow-hidden border border-slate-700">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Spinner />
                    <span>Adding Prop...</span>
                    </div>
                ) : propPanel ? (
                    <img src={`data:image/jpeg;base64,${propPanel.image.base64}`} alt="Scene with Prop" className="w-full h-full object-contain" />
                ) : (
                    <p className="text-slate-500 p-4 text-center">Your new scene will appear here.</p>
                )}
                </div>
            </div>
        </div>

        {propPanel && (
            <button
                onClick={handleReplace}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-blue-700 disabled:bg-slate-600 transition-colors flex items-center justify-center gap-2 mt-4"
            >
                Replace in Library
            </button>
        )}
      </div>
    </div>
  );
};

export default PropsStudio;