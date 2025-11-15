import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import LayersIcon from './icons/LayersIcon';
import Spinner from './Spinner';
import DownloadIcon from './icons/DownloadIcon';

interface CompositingPanelProps {
  character: GeneratedImage | null;
  background: GeneratedImage | null;
  onComposite: (instructions: string) => void;
  isLoading: boolean;
  finalPanel: GeneratedImage | null;
  panelDescription: string;
}

const CompositingPanel: React.FC<CompositingPanelProps> = ({ character, background, onComposite, isLoading, finalPanel, panelDescription }) => {
  const [instructions, setInstructions] = useState('');
  
  const canComposite = character && background && instructions.trim();

  const handleComposite = () => {
    if (canComposite) {
      onComposite(instructions);
    }
  };
  
  React.useEffect(() => {
    if (panelDescription) {
        setInstructions(panelDescription);
    }
  }, [panelDescription]);
  
  const handleDownload = () => {
    if (!finalPanel) return;
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${finalPanel.base64}`;
    link.download = `comic-panel-${Date.now()}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <LayersIcon className="w-6 h-6 text-teal-400" />
        <h2 className="text-xl font-semibold">Composite Scene</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center gap-2">
            <div className="w-full aspect-square bg-slate-700 rounded-md flex items-center justify-center overflow-hidden">
                {character ? <img src={`data:image/jpeg;base64,${character.base64}`} alt="Selected Character" className="w-full h-full object-contain" /> : <p className="text-slate-500 text-sm p-2 text-center">Character from step 1 appears here</p>}
            </div>
            <p className="font-semibold text-slate-300">Character</p>
        </div>
        <div className="flex flex-col items-center gap-2">
            <div className="w-full aspect-square bg-slate-700 rounded-md flex items-center justify-center overflow-hidden">
                {background ? <img src={`data:image/jpeg;base64,${background.base64}`} alt="Selected Background" className="w-full h-full object-contain" /> : <p className="text-slate-500 text-sm p-2 text-center">Background from step 2 appears here</p>}
            </div>
             <p className="font-semibold text-slate-300">Background</p>
        </div>
      </div>

      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Describe how to place the character in the scene. e.g., 'Place the character on the left, looking towards the city.'"
        className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
        rows={4}
        disabled={isLoading || !character || !background}
      />

      <button
        onClick={handleComposite}
        disabled={isLoading || !canComposite}
        className="w-full bg-teal-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-teal-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? <Spinner /> : 'Generate Final Panel'}
      </button>

       <div className="relative aspect-square bg-slate-900 rounded-md mt-2 flex items-center justify-center overflow-hidden border border-slate-700">
        {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-slate-400">
                <Spinner />
                <span>Compositing...</span>
            </div>
        ) : finalPanel ? (
          <>
            <img src={`data:image/jpeg;base64,${finalPanel.base64}`} alt={finalPanel.prompt} className="w-full h-full object-contain" />
            <button
              onClick={handleDownload}
              className="absolute bottom-3 right-3 bg-blue-600/80 text-white p-2 rounded-full hover:bg-blue-600 transition-colors backdrop-blur-sm"
              title="Save Final Panel"
              aria-label="Save Final Panel"
            >
              <DownloadIcon className="w-5 h-5" />
            </button>
          </>
        ) : (
          <p className="text-slate-500 p-4 text-center">Your final comic panel will appear here.</p>
        )}
      </div>

    </div>
  );
};

export default CompositingPanel;