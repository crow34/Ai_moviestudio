import React, { useState } from 'react';
import { GenerationType, AspectRatio, GeneratedImage } from '../types';
import { ASPECT_RATIOS } from '../constants';
import ImageIcon from './icons/ImageIcon';
import Spinner from './Spinner';

interface GeneratorPanelProps {
  title: string;
  placeholder: string;
  generationType: GenerationType;
  onGenerate: (prompt: string, aspectRatio: AspectRatio) => void;
  isLoading: boolean;
  generatedImage: GeneratedImage | null;
}

const GeneratorPanel: React.FC<GeneratorPanelProps> = ({ title, placeholder, generationType, onGenerate, isLoading, generatedImage }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt, aspectRatio);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <ImageIcon className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={placeholder}
        className="w-full flex-grow bg-slate-700 border border-slate-600 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        rows={6}
        disabled={isLoading}
      />
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor={`${generationType}-aspect-ratio`} className="block text-sm font-medium text-slate-400 mb-1">Aspect Ratio</label>
          <select
            id={`${generationType}-aspect-ratio`}
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={isLoading}
          >
            {ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
          </select>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="flex-1 self-end bg-blue-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? <Spinner /> : 'Generate'}
        </button>
      </div>
      <div className="aspect-square bg-slate-700/50 rounded-md mt-2 flex items-center justify-center overflow-hidden">
        {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-slate-400">
                <Spinner />
                <span>Generating...</span>
            </div>
        ) : generatedImage ? (
          <img src={`data:image/jpeg;base64,${generatedImage.base64}`} alt={generatedImage.prompt} className="w-full h-full object-contain" />
        ) : (
          <p className="text-slate-500">Image will appear here</p>
        )}
      </div>
    </div>
  );
};

export default GeneratorPanel;