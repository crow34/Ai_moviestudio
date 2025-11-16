import React, { useState } from 'react';
import { View } from '../App';
import { ComicSceneScript } from '../types';
import BookIcon from './icons/BookIcon';
import Spinner from './Spinner';
import LayersIcon from './icons/LayersIcon';
import SparkleIcon from './icons/SparkleIcon';

interface ScriptWritingStudioProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  script: ComicSceneScript[] | null;
  setActiveView: (view: View) => void;
}

const ScriptWritingStudio: React.FC<ScriptWritingStudioProps> = ({ onGenerate, isLoading, script, setActiveView }) => {
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You can add a toast notification here for better UX
    }, (err) => {
      console.error('Could not copy text: ', err);
      alert('Failed to copy text.');
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <BookIcon className="w-8 h-8 text-purple-400" />
          <h2 className="text-2xl font-semibold">Script Writing Studio</h2>
        </div>
        <div className="flex items-center gap-2 bg-zinc-800/50 p-3 rounded-lg text-sm text-slate-400">
          <SparkleIcon className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <span>Using Gemini 2.5 Pro to generate a complete comic book script from your idea.</span>
        </div>
        <p className="text-slate-400">Enter a story idea, and the AI will generate a script complete with scenes, panel-by-panel descriptions, and dialogue. You can then copy these descriptions into the Scene Editor to create your panels.</p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A detective in a cyberpunk city investigates a rogue AI, but the AI is not what it seems..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
          rows={4}
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg px-4 py-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
        >
          {isLoading ? <Spinner /> : 'Generate Script'}
        </button>
      </div>
      
      <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">Generated Script</h3>
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 min-h-[300px] max-h-[60vh] overflow-y-auto">
           {isLoading ? (
             <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 pt-8">
                <Spinner />
                <span>Writing your script...</span>
            </div>
          ) : script ? (
            <div className="space-y-6 text-slate-300">
                {script.map((scene, sceneIndex) => (
                    <div key={sceneIndex} className="space-y-4">
                        <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                            <h4 className="text-lg font-bold text-purple-400">Scene {scene.scene}: {scene.setting}</h4>
                        </div>
                        {scene.panels.map((panel, panelIndex) => (
                            <div key={panelIndex} className="pl-4 border-l-2 border-zinc-700 space-y-2 relative group">
                                <h5 className="font-semibold text-slate-200">Panel {panel.panel}</h5>
                                <p className="text-slate-400">{panel.description}</p>
                                {panel.dialogue && panel.dialogue.map((d, dialogIndex) => (
                                    <p key={dialogIndex} className="pl-4">
                                        <strong className="text-slate-300">{d.character}:</strong>
                                        <span className="text-slate-400 italic"> "{d.line}"</span>
                                    </p>
                                ))}
                                <button 
                                  onClick={() => handleCopyToClipboard(panel.description)}
                                  title="Copy panel description"
                                  className="absolute top-0 right-0 bg-zinc-800 text-slate-400 text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-700 hover:text-slate-200"
                                >
                                  Copy Desc
                                </button>
                            </div>
                        ))}
                    </div>
                ))}
                <div className="text-center pt-6">
                     <button
                        onClick={() => setActiveView('editor')}
                        className="bg-gradient-to-r from-teal-500 to-sky-600 text-white font-semibold rounded-lg px-6 py-3 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mx-auto"
                        >
                        <LayersIcon className="w-5 h-5" />
                        Go to Scene Editor
                    </button>
                </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">Your comic script will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptWritingStudio;
