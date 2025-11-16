import React, { useState, useRef } from 'react';
import { GeneratedImage, AspectRatio, BodyShape } from '../types';
import { IMAGEN_ASPECT_RATIOS, BODY_SHAPES_TEXT } from '../constants';
import UserIcon from './icons/UserIcon';
import Spinner from './Spinner';
import ImageGallery from './ImageGallery';
import CharacterCreator from './CharacterCreator';

interface CharacterStudioProps {
  characters: GeneratedImage[];
  onGenerate: (prompt: string, aspectRatio: AspectRatio, name: string, pose: string, expression: string, outfit: string, bodyShape: BodyShape) => void;
  onAddCharacter: (base64: string, prompt: string, name: string) => void;
  onImport: (characters: GeneratedImage[]) => void;
  isLoading: boolean;
}

const CharacterStudio: React.FC<CharacterStudioProps> = ({ characters, onGenerate, onAddCharacter, onImport, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');
  const [outfit, setOutfit] = useState('');
  const [pose, setPose] = useState('');
  const [expression, setExpression] = useState('');
  const [bodyShape, setBodyShape] = useState<BodyShape>('Default');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const canGenerate = characters.length < 4;
  const importInputRef = useRef<HTMLInputElement>(null);
  const importImageInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = () => {
    if (prompt.trim() && name.trim() && canGenerate) {
      onGenerate(prompt, aspectRatio, name, pose, expression, outfit, bodyShape);
      setPrompt('');
      setName('');
      setOutfit('');
      setPose('');
      setExpression('');
      setBodyShape('Default');
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(characters, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "comic-characters.json");
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
            const importedCharacters = JSON.parse(content);
            onImport(importedCharacters);
          }
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          alert("Could not import characters. The file may be corrupt or in the wrong format.");
        }
      };
      reader.readAsText(file);
      event.target.value = ''; // Reset file input
    }
  };

  const handleImageImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (characters.length >= 4) {
      alert("Character library is full. You can't import more characters.");
      event.target.value = '';
      return;
    }
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const base64WithMime = e.target?.result;
          if (typeof base64WithMime === 'string') {
            const name = window.prompt("Please enter a name for the imported character:");
            if (name && name.trim()) {
              const base64 = base64WithMime.split(',')[1];
              onAddCharacter(base64, `Imported character: ${name.trim()}`, name.trim());
            } else if (name !== null) { // User clicked OK but left it empty
              alert("Character name cannot be empty.");
            }
          }
        } catch (error) {
          console.error("Error reading image file:", error);
          alert("Could not import character from image.");
        }
      };
      reader.readAsDataURL(file);
      event.target.value = ''; // Reset file input to allow re-uploading the same file
    }
  };

  const triggerImport = () => {
    importInputRef.current?.click();
  };
  
  const triggerImageImport = () => {
    importImageInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
      <CharacterCreator onAddCharacter={onAddCharacter} />
      <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <UserIcon className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold">Character Generator (from Text)</h2>
        </div>
        <p className="text-slate-400 text-sm">Alternatively, create a character from a text description. Generate up to 4 characters to use in the Scene Editor.</p>
        <div>
            <label htmlFor="char-prompt" className="block text-sm font-medium text-slate-400 mb-1">Character Prompt</label>
            <textarea
                id="char-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A brave space explorer wearing a blue suit..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                rows={3}
                disabled={isLoading || !canGenerate}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                 <label htmlFor="char-name" className="block text-sm font-medium text-slate-400 mb-1">Character Name</label>
                 <input
                    id="char-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Captain Eva"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={isLoading || !canGenerate}
                 />
            </div>
            <div>
                 <label htmlFor="char-outfit" className="block text-sm font-medium text-slate-400 mb-1">Outfit (Optional)</label>
                 <input
                    id="char-outfit"
                    type="text"
                    value={outfit}
                    onChange={(e) => setOutfit(e.target.value)}
                    placeholder="e.g., High-tech silver armor"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={isLoading || !canGenerate}
                 />
            </div>
             <div>
                <label htmlFor="char-body-shape" className="block text-sm font-medium text-slate-400 mb-1">Body Shape (Optional)</label>
                <select
                    id="char-body-shape"
                    value={bodyShape}
                    onChange={(e) => setBodyShape(e.target.value as BodyShape)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none h-full"
                    disabled={isLoading || !canGenerate}
                >
                    {BODY_SHAPES_TEXT.map(shape => <option key={shape.value} value={shape.value}>{shape.label}</option>)}
                </select>
            </div>
            <div>
                 <label htmlFor="char-pose" className="block text-sm font-medium text-slate-400 mb-1">Pose (Optional)</label>
                 <input
                    id="char-pose"
                    type="text"
                    value={pose}
                    onChange={(e) => setPose(e.target.value)}
                    placeholder="e.g., Standing heroically"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={isLoading || !canGenerate}
                 />
            </div>
            <div>
                 <label htmlFor="char-expression" className="block text-sm font-medium text-slate-400 mb-1">Facial Expression (Optional)</label>
                 <input
                    id="char-expression"
                    type="text"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder="e.g., A confident smile"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={isLoading || !canGenerate}
                 />
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="char-aspect-ratio" className="block text-sm font-medium text-slate-400 mb-1">Aspect Ratio</label>
            <select
              id="char-aspect-ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={isLoading || !canGenerate}
            >
              {IMAGEN_ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim() || !name.trim() || !canGenerate}
            className="flex-1 self-end bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg px-4 py-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
          >
            {isLoading ? <Spinner /> : 'Generate Character'}
          </button>
        </div>
         {!canGenerate && <p className="text-center text-yellow-400 text-sm">Character library is full. Go to the Scene Editor to use them.</p>}
      </div>
      <ImageGallery title="Character Library" images={characters} allowExport />
      
      <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Library Management</h3>
            <p className="text-sm text-slate-400">Save your character library to a file or load an existing one.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <button onClick={handleExport} disabled={characters.length === 0} className="bg-zinc-800 text-white font-semibold rounded-lg px-4 py-2 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors">Export</button>
            <button onClick={triggerImport} className="bg-zinc-800 text-white font-semibold rounded-lg px-4 py-2 hover:bg-zinc-700 transition-colors">Import (.json)</button>
            <button onClick={triggerImageImport} className="bg-zinc-800 text-white font-semibold rounded-lg px-4 py-2 hover:bg-zinc-700 transition-colors">Import (Image)</button>
            <input type="file" ref={importInputRef} onChange={handleImport} accept=".json" className="hidden" />
            <input type="file" ref={importImageInputRef} onChange={handleImageImport} accept="image/jpeg,image/png" className="hidden" />
          </div>
        </div>
      </div>

    </div>
  );
};

export default CharacterStudio;