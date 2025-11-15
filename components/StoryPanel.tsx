import React, { useState } from 'react';
import BookIcon from './icons/BookIcon';
import Spinner from './Spinner';
import SparkleIcon from './icons/SparkleIcon';

interface StoryPanelProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  panelDescription: string;
}

const StoryPanel: React.FC<StoryPanelProps> = ({ onGenerate, isLoading, panelDescription }) => {
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <BookIcon className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-semibold">Generate Story Panel</h2>
      </div>
       <div className="flex items-center gap-2 bg-slate-700/50 p-2 rounded-md text-sm text-slate-400">
          <SparkleIcon className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <span>Using Gemini 2.5 Pro with max thinking budget for complex story generation.</span>
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., A space explorer discovers an ancient alien artifact."
        className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
        rows={4}
        disabled={isLoading}
      />
      <button
        onClick={handleGenerate}
        disabled={isLoading || !prompt.trim()}
        className="w-full bg-purple-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? <Spinner /> : 'Generate'}
      </button>
      <div className="flex-grow bg-slate-900 rounded-md mt-2 p-4 min-h-[200px] border border-slate-700">
        <h3 className="text-slate-400 font-semibold mb-2">Generated Description:</h3>
        {isLoading ? (
             <div className="flex flex-col items-center gap-2 text-slate-400 pt-8">
                <Spinner />
                <span>Thinking...</span>
            </div>
        ) : panelDescription ? (
          <p className="text-slate-300 whitespace-pre-wrap">{panelDescription}</p>
        ) : (
          <p className="text-slate-500">Story panel description will appear here.</p>
        )}
      </div>
    </div>
  );
};

export default StoryPanel;