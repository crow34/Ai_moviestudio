import React, { useState, useEffect } from 'react';
import { GeneratedImage, CameraAngle, AspectRatio, FilmType, PostFxType } from '../types';
import { CAMERA_ANGLES, ASPECT_RATIOS, COMIC_STICKERS, FILM_TYPES, POST_FX_TYPES, CAMERA_PRESETS } from '../constants';
import ImageGallery from './ImageGallery';
import LayersIcon from './icons/LayersIcon';
import Spinner from './Spinner';
import SparkleIcon from './icons/SparkleIcon';
import DownloadIcon from './icons/DownloadIcon';
import BookIcon from './icons/BookIcon';
import XMarkIcon from './icons/XMarkIcon';
import CameraIcon from './icons/CameraIcon';
import UserIcon from './icons/UserIcon';
import ChatBubbleIcon from './icons/ChatBubbleIcon';
import FilmIcon from './icons/FilmIcon';
import WandIcon from './icons/WandIcon';
import { View } from '../App';
import VideoIcon from './icons/VideoIcon';
import ChatBubbleDoubleIcon from './icons/ChatBubbleDoubleIcon';
import ActionIcon from './icons/ActionIcon';
import ThoughtIcon from './icons/ThoughtIcon';

interface SceneEditorProps {
  characters: GeneratedImage[];
  scenes: GeneratedImage[];
  selectedCharacters: GeneratedImage[];
  selectedScene: GeneratedImage | null;
  onToggleCharacterSelection: (character: GeneratedImage) => void;
  onSelectScene: (scene: GeneratedImage | null) => void;
  onComposite: (instructions: string, aspectRatio: AspectRatio) => void;
  onRefine: (refinementPrompt: string) => void;
  isLoading: boolean;
  finalPanel: GeneratedImage | null;
  onApplyFilmGrade: (filmType: FilmType) => void;
  isGradingLoading: boolean;
  onApplyPostFx: (fxType: PostFxType) => void;
  isPostFxLoading: boolean;
  onContinueStoryboard: () => void;
  isStoryboardLoading: boolean;
  onGenerateConversationShot: (aspectRatio: AspectRatio) => void;
  isConversationLoading: boolean;
  onGenerateActionShot: (aspectRatio: AspectRatio) => void;
  isActionShotLoading: boolean;
  onGenerateThoughtShot: (aspectRatio: AspectRatio) => void;
  isThoughtShotLoading: boolean;
  setActiveView: (view: View) => void;
}

interface Dialogue {
  id: number;
  characterId: string;
  text: string;
}

interface CharacterAdjustments {
    pose: string;
    expression: string;
    gaze: string;
}

const SceneEditor: React.FC<SceneEditorProps> = ({
  characters,
  scenes,
  selectedCharacters,
  selectedScene,
  onToggleCharacterSelection,
  onSelectScene,
  onComposite,
  onRefine,
  isLoading,
  finalPanel,
  onApplyFilmGrade,
  isGradingLoading,
  onApplyPostFx,
  isPostFxLoading,
  onContinueStoryboard,
  isStoryboardLoading,
  onGenerateConversationShot,
  isConversationLoading,
  onGenerateActionShot,
  isActionShotLoading,
  onGenerateThoughtShot,
  isThoughtShotLoading,
  setActiveView,
}) => {
  const [instructions, setInstructions] = useState('');
  const [characterAdjustments, setCharacterAdjustments] = useState<Record<string, CharacterAdjustments>>({});
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [stickers, setStickers] = useState<string[]>([]);
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('none');
  const [cameraPreset, setCameraPreset] = useState<string>('custom');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [filmType, setFilmType] = useState<FilmType>('None');
  const [postFxType, setPostFxType] = useState<PostFxType>('None');
  
  const canComposite = selectedCharacters.length > 0 && selectedScene && instructions.trim();
  const isProcessing = isLoading || isGradingLoading || isPostFxLoading || isStoryboardLoading || isConversationLoading || isActionShotLoading || isThoughtShotLoading;

  useEffect(() => {
    const selectedIds = new Set(selectedCharacters.map(c => c.id));
    setCharacterAdjustments(prev => {
        const next = {...prev};
        Object.keys(next).forEach(id => {
            if (!selectedIds.has(id)) {
                delete next[id];
            }
        });
        return next;
    });
  }, [selectedCharacters]);


  const handleAddDialogue = () => {
    if (characters.length > 0) {
      setDialogues([...dialogues, { id: Date.now(), characterId: '', text: '' }]);
    } else {
      alert("You need to create a character first to add dialogue.");
    }
  };
  
  const handleAddSticker = (sticker: string) => {
      setStickers([...stickers, sticker]);
  };

  const handleRemoveSticker = (indexToRemove: number) => {
    setStickers(stickers.filter((_, index) => index !== indexToRemove));
  };


  const handleRemoveDialogue = (id: number) => {
    setDialogues(dialogues.filter(d => d.id !== id));
  };

  const handleDialogueChange = (id: number, field: 'characterId' | 'text', value: string) => {
    setDialogues(dialogues.map(d => d.id === id ? { ...d, [field]: value } : d));
  };
  
  const handleAdjustmentChange = (charId: string, field: keyof CharacterAdjustments, value: string) => {
    setCharacterAdjustments(prev => ({
        ...prev,
        [charId]: {
            pose: '',
            expression: '',
            gaze: '',
            ...prev[charId],
            [field]: value,
        }
    }));
  };

  const buildCompositeInstructions = (angle: CameraAngle): string => {
    let finalInstructions = instructions;
    
    selectedCharacters.forEach(char => {
        const adj = characterAdjustments[char.id];
        let charInstruction = `\nFor the character named "${char.name}":`;
        let hasAdjustment = false;
        if (adj?.pose?.trim()) {
            charInstruction += ` Their pose should be: ${adj.pose}.`;
            hasAdjustment = true;
        }
        if (adj?.expression?.trim()) {
            charInstruction += ` Their facial expression should be: ${adj.expression}.`;
            hasAdjustment = true;
        }
        if (adj?.gaze?.trim()) {
            charInstruction += ` Their gaze should be directed: ${adj.gaze}.`;
            hasAdjustment = true;
        }
        if (hasAdjustment) {
            finalInstructions += charInstruction;
        }
    });

    if (angle !== 'none') {
        const angleInfo = CAMERA_ANGLES.find(a => a.value === angle);
        if (angleInfo) {
            finalInstructions += `\n- **Camera Angle Requirement:** The entire composition MUST be rendered from a ${angleInfo.label}. This is a crucial instruction.`;
        }
    }

    dialogues.forEach(dialogue => {
      const character = characters.find(c => c.id === dialogue.characterId);
      if (character && dialogue.text.trim()) {
        finalInstructions += `\n- Add a speech bubble for the character named "${character.name}" with the text: "${dialogue.text.trim()}".`;
      }
    });
    
    if (stickers.length > 0) {
        finalInstructions += `\n- Include the following comic book sound effect stickers: ${stickers.join(', ')}. The placement and style of these stickers are described in the main instructions.`;
    }
    
    return finalInstructions;
  };
  
  const handleComposite = () => {
    if (!canComposite) return;
    const finalInstructions = buildCompositeInstructions(cameraAngle);
    onComposite(finalInstructions, aspectRatio);
  };
  
  const handleDownload = (panel: GeneratedImage | null) => {
    if (!panel) return;
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${panel.base64}`;
    link.download = `comic-panel-${Date.now()}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefine = () => {
    if (refinementPrompt.trim() && finalPanel) {
      onRefine(refinementPrompt);
      setRefinementPrompt('');
    }
  };

  const handleApplyGrade = () => {
    if (filmType !== 'None' && finalPanel) {
        onApplyFilmGrade(filmType);
    }
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetValue = e.target.value;
    setCameraPreset(presetValue);

    const selectedPreset = CAMERA_PRESETS.find(p => p.value === presetValue);
    if (selectedPreset) {
        setCameraAngle(selectedPreset.angle);
        if (selectedPreset.instructionTemplate) {
            setInstructions(selectedPreset.instructionTemplate);
        }
    }
  };

  const aspectRatioClasses: Record<AspectRatio, string> = {
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16]',
    '4:3': 'aspect-[4/3]',
    '3:4': 'aspect-[3/4]',
    '21:9': 'aspect-[21/9]',
  };

  const getLoadingMessage = () => {
    if (isLoading) return 'Generating/Refining...';
    if (isGradingLoading) return 'Applying Grade...';
    if (isPostFxLoading) return 'Applying Effect...';
    if (isStoryboardLoading) return 'Generating Storyboard...';
    if (isConversationLoading) return 'Generating Conversation Shot...';
    if (isActionShotLoading) return 'Generating Action Shot...';
    if (isThoughtShotLoading) return 'Generating Thought Shot...';
    return '';
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="space-y-8">
        <ImageGallery
          title="1. Select Character(s)"
          images={characters}
          selectedIds={selectedCharacters.map(c => c.id)}
          onSelect={onToggleCharacterSelection}
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
          <LayersIcon className="w-6 h-6 text-teal-400" />
          <h2 className="text-xl font-semibold">3. Compose Final Panel</h2>
        </div>
        <div className="flex items-center gap-2 bg-zinc-800/50 p-3 rounded-lg text-sm text-slate-400">
          <SparkleIcon className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span>Using Gemini 2.5 Flash Image to intelligently compose the scene.</span>
        </div>

        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Describe the final scene and character interactions..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
          rows={3}
          disabled={isProcessing || selectedCharacters.length === 0 || !selectedScene}
        />
        
        {/* Character Pose and Expression Section */}
        {selectedCharacters.length > 0 && (
            <div className="border-t border-zinc-700 pt-4 space-y-3">
                <div className="flex items-center gap-3 mb-2">
                    <UserIcon className="w-6 h-6 text-teal-400" />
                    <h3 className="text-lg font-semibold text-slate-200">Character Adjustments ({selectedCharacters.length} selected)</h3>
                </div>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                    {selectedCharacters.map(char => (
                        <div key={char.id} className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                            <p className="font-semibold text-slate-300 mb-2 truncate" title={char.name}>{char.name}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div>
                                    <label htmlFor={`char-pose-${char.id}`} className="block text-xs font-medium text-slate-400 mb-1">Pose</label>
                                    <input
                                        id={`char-pose-${char.id}`}
                                        type="text"
                                        value={characterAdjustments[char.id]?.pose || ''}
                                        onChange={(e) => handleAdjustmentChange(char.id, 'pose', e.target.value)}
                                        placeholder="e.g., Running"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-sm text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        disabled={isProcessing}
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`char-expression-${char.id}`} className="block text-xs font-medium text-slate-400 mb-1">Expression</label>
                                    <input
                                        id={`char-expression-${char.id}`}
                                        type="text"
                                        value={characterAdjustments[char.id]?.expression || ''}
                                        onChange={(e) => handleAdjustmentChange(char.id, 'expression', e.target.value)}
                                        placeholder="e.g., Surprised"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-sm text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        disabled={isProcessing}
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`char-gaze-${char.id}`} className="block text-xs font-medium text-slate-400 mb-1">Gaze</label>
                                    <input
                                        id={`char-gaze-${char.id}`}
                                        type="text"
                                        value={characterAdjustments[char.id]?.gaze || ''}
                                        onChange={(e) => handleAdjustmentChange(char.id, 'gaze', e.target.value)}
                                        placeholder="e.g., Towards window"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-sm text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        disabled={isProcessing}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Panel Layout Section */}
        <div className="border-t border-zinc-700 pt-4 space-y-4">
            <div className="flex items-center gap-3">
                <CameraIcon className="w-6 h-6 text-teal-400" />
                <h3 className="text-lg font-semibold text-slate-200">Panel Layout</h3>
            </div>
            <div>
                <label htmlFor="camera-preset" className="block text-sm font-medium text-slate-400 mb-1">Camera Preset</label>
                <select
                    id="camera-preset"
                    value={cameraPreset}
                    onChange={handlePresetChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    disabled={isProcessing || selectedCharacters.length === 0 || !selectedScene}
                >
                    {CAMERA_PRESETS.map(preset => <option key={preset.value} value={preset.value}>{preset.label}</option>)}
                </select>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="camera-angle" className="block text-sm font-medium text-slate-400 mb-1">Camera Angle (Manual)</label>
                    <select
                        id="camera-angle"
                        value={cameraAngle}
                        onChange={(e) => {
                            setCameraAngle(e.target.value as CameraAngle);
                            setCameraPreset('custom');
                        }}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        disabled={isProcessing || selectedCharacters.length === 0 || !selectedScene}
                    >
                        {CAMERA_ANGLES.map(angle => <option key={angle.value} value={angle.value}>{angle.label}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="panel-size" className="block text-sm font-medium text-slate-400 mb-1">Panel Size</label>
                    <select
                        id="panel-size"
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        disabled={isProcessing || selectedCharacters.length === 0 || !selectedScene}
                    >
                        {ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                    </select>
                </div>
            </div>
        </div>


        {/* Dialogue Section */}
        <div className="border-t border-zinc-700 pt-4 space-y-3">
            <div className="flex items-center gap-3">
                 <BookIcon className="w-6 h-6 text-teal-400" />
                <h3 className="text-lg font-semibold text-slate-200">Dialogue</h3>
            </div>
            {dialogues.map((dialogue) => (
                <div key={dialogue.id} className="grid grid-cols-[1fr,2fr,auto] gap-2 items-center">
                    <select
                        value={dialogue.characterId}
                        onChange={(e) => handleDialogueChange(dialogue.id, 'characterId', e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        disabled={isProcessing}
                    >
                        <option value="">Select Character</option>
                        {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Enter dialogue..."
                        value={dialogue.text}
                        onChange={(e) => handleDialogueChange(dialogue.id, 'text', e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        disabled={isProcessing}
                    />
                    <button onClick={() => handleRemoveDialogue(dialogue.id)} className="text-slate-400 hover:text-red-400 p-1" aria-label="Remove dialogue">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            ))}
            <button
                onClick={handleAddDialogue}
                disabled={isProcessing || characters.length === 0}
                className="w-full bg-zinc-800/80 text-slate-300 font-semibold text-sm rounded-lg px-4 py-2 hover:bg-zinc-700/80 disabled:bg-zinc-900 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            >
                + Add Dialogue
            </button>
        </div>
        
        {/* Stickers & Effects Section */}
        <div className="border-t border-zinc-700 pt-4 space-y-3">
            <div className="flex items-center gap-3">
                <ChatBubbleIcon className="w-6 h-6 text-teal-400" />
                <h3 className="text-lg font-semibold text-slate-200">Stickers & Effects</h3>
            </div>
            <p className="text-sm text-slate-400">Click to add stickers. Describe their placement in the main instructions above.</p>
            <div className="flex flex-wrap gap-2">
                {COMIC_STICKERS.map(sticker => (
                    <button key={sticker} onClick={() => handleAddSticker(sticker)} disabled={isProcessing} className="bg-zinc-800 text-slate-200 font-bold text-sm rounded-md px-3 py-1 hover:bg-zinc-700 transition-colors disabled:bg-zinc-900 disabled:cursor-not-allowed">
                        {sticker}
                    </button>
                ))}
            </div>
            {stickers.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    {stickers.map((sticker, index) => (
                        <div key={index} className="flex items-center gap-1 bg-teal-500/20 text-teal-300 text-xs font-semibold rounded-full px-2 py-1">
                            <span>{sticker}</span>
                            <button onClick={() => handleRemoveSticker(index)} className="text-teal-300 hover:text-white">
                                <XMarkIcon className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>


        <button
          onClick={handleComposite}
          disabled={isProcessing || !canComposite}
          className="w-full bg-gradient-to-r from-teal-500 to-sky-600 text-white font-semibold rounded-lg px-4 py-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 mt-auto"
        >
          {isProcessing ? <Spinner /> : 'Generate Final Panel'}
        </button>

        <div className={`relative ${aspectRatioClasses[aspectRatio]} w-full bg-zinc-950 rounded-lg mt-2 flex items-center justify-center overflow-hidden border border-zinc-700`}>
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Spinner />
              <span>{getLoadingMessage()}</span>
            </div>
          ) : finalPanel ? (
            <>
              <img src={`data:image/jpeg;base64,${finalPanel.base64}`} alt={finalPanel.prompt} className="w-full h-full object-contain" />
              <button
                onClick={() => handleDownload(finalPanel)}
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

        {finalPanel && !isProcessing && (
          <>
            <div className="border-t border-zinc-700 pt-4 mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <CameraIcon className="w-6 h-6 text-cyan-400" />
                <h3 className="text-lg font-semibold text-slate-200">4. Shot Variation</h3>
              </div>
              <p className="text-sm text-slate-400">
                Quickly generate variations of your panel for different moments. The AI will pick a suitable camera angle.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => onGenerateConversationShot(aspectRatio)}
                  disabled={isProcessing}
                  className="w-full bg-cyan-800 text-white font-semibold rounded-lg px-4 py-3 hover:bg-cyan-700 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isConversationLoading ? <Spinner /> : <ChatBubbleDoubleIcon className="w-5 h-5" />}
                  Conversation
                </button>
                <button
                  onClick={() => onGenerateActionShot(aspectRatio)}
                  disabled={isProcessing}
                  className="w-full bg-rose-800 text-white font-semibold rounded-lg px-4 py-3 hover:bg-rose-700 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isActionShotLoading ? <Spinner /> : <ActionIcon className="w-5 h-5" />}
                  Action
                </button>
                 <button
                  onClick={() => onGenerateThoughtShot(aspectRatio)}
                  disabled={isProcessing}
                  className="w-full bg-purple-800 text-white font-semibold rounded-lg px-4 py-3 hover:bg-purple-700 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isThoughtShotLoading ? <Spinner /> : <ThoughtIcon className="w-5 h-5" />}
                  Thought
                </button>
              </div>
            </div>

            <div className="border-t border-zinc-700 pt-4 mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <SparkleIcon className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-slate-200">5. Refine Panel</h3>
              </div>
              <p className="text-sm text-slate-400">
                Use Gemini 2.5 Flash Image to make changes to the generated panel.
              </p>
              <textarea
                value={refinementPrompt}
                onChange={(e) => setRefinementPrompt(e.target.value)}
                placeholder="e.g., Make the character's suit red, add rain to the scene."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:outline-none resize-none"
                rows={3}
                disabled={isProcessing}
              />
              <button
                onClick={handleRefine}
                disabled={isProcessing || !refinementPrompt.trim()}
                className="w-full bg-yellow-600 text-white font-semibold rounded-lg px-4 py-3 hover:bg-yellow-700 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <Spinner /> : 'Refine Panel'}
              </button>
            </div>
            <div className="border-t border-zinc-700 pt-4 mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <FilmIcon className="w-6 h-6 text-indigo-400" />
                <h3 className="text-lg font-semibold text-slate-200">6. Film & Color Grade</h3>
              </div>
              <p className="text-sm text-slate-400">Apply a cinematic film look to your latest panel to add grain, specific color grading, and atmosphere.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={filmType}
                  onChange={(e) => setFilmType(e.target.value as FilmType)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  disabled={isProcessing}
                >
                  {FILM_TYPES.map(fType => <option key={fType.value} value={fType.value}>{fType.label}</option>)}
                </select>
                <button
                  onClick={handleApplyGrade}
                  disabled={isProcessing || filmType === 'None'}
                  className="w-full bg-indigo-600 text-white font-semibold rounded-lg px-4 py-3 hover:bg-indigo-700 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isGradingLoading ? <Spinner /> : 'Apply Filter'}
                </button>
              </div>
            </div>
            <div className="border-t border-zinc-700 pt-4 mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <WandIcon className="w-6 h-6 text-pink-400" />
                <h3 className="text-lg font-semibold text-slate-200">7. Post-Processing FX</h3>
              </div>
              <p className="text-sm text-slate-400">Apply special visual effects to your final panel for extra stylistic flair.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={postFxType}
                  onChange={(e) => setPostFxType(e.target.value as PostFxType)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  disabled={isProcessing}
                >
                  {POST_FX_TYPES.map(fx => <option key={fx.value} value={fx.value}>{fx.label}</option>)}
                </select>
                <button
                  onClick={() => onApplyPostFx(postFxType)}
                  disabled={isProcessing || postFxType === 'None'}
                  className="w-full bg-pink-600 text-white font-semibold rounded-lg px-4 py-3 hover:bg-pink-700 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isPostFxLoading ? <Spinner /> : 'Apply Effect'}
                </button>
              </div>
            </div>
             <div className="border-t border-zinc-700 pt-4 mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <BookIcon className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-slate-200">8. Next Steps...</h3>
              </div>
              <p className="text-sm text-slate-400">
                Continue the story with AI-generated scenes, or bring your panel to life in the Video Lab.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={onContinueStoryboard}
                    disabled={isStoryboardLoading}
                    className="w-full bg-purple-600 text-white font-semibold rounded-lg px-4 py-3 hover:bg-purple-700 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    {isStoryboardLoading ? <Spinner /> : 'Continue Storyboard'}
                </button>
                <button
                    onClick={() => setActiveView('video')}
                    className="w-full bg-rose-600 text-white font-semibold rounded-lg px-4 py-3 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
                >
                   <VideoIcon className="w-5 h-5" />
                   Animate This Panel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SceneEditor;
