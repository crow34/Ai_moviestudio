import React, { useState, useRef, useCallback } from 'react';
import { ArtStyle, BodyShape } from '../types';
import { ART_STYLES, BODY_SHAPES_PHOTO } from '../constants';
import Spinner from './Spinner';
import { transformImage, getCharacterArtStyleDescription } from '../services/geminiService';
import ImageIcon from './icons/ImageIcon';
import SparkleIcon from './icons/SparkleIcon';

interface CharacterCreatorProps {
  onAddCharacter: (base64: string, prompt: string, name: string) => void;
}

const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onAddCharacter }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [artStyle, setArtStyle] = useState<ArtStyle>('None');
  const [wardrobe, setWardrobe] = useState('');
  const [pose, setPose] = useState('');
  const [expression, setExpression] = useState('');
  const [bodyShape, setBodyShape] = useState<BodyShape>('Default');
  const [characterName, setCharacterName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCharacter, setGeneratedCharacter] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setGeneratedCharacter(null); // Clear previous generation
        setCharacterName('');
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleGenerateClick = useCallback(async () => {
    if (!uploadedImage) {
      alert("Please upload an image first.");
      return;
    }
    setIsLoading(true);
    setGeneratedCharacter(null);
    try {
      const mimeType = uploadedImage.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';
      const base64Data = uploadedImage.split(',')[1];
      const clothingDescription = wardrobe.trim() ? `The character should be wearing: ${wardrobe}.` : '';
      const poseDescription = pose.trim() ? `The character should have the following pose: ${pose}.` : '';
      const expressionDescription = expression.trim() ? `The character should have a ${expression} facial expression.` : '';
      const bodyShapeDescription = bodyShape !== 'Default' ? `The character's body type should be modified to be ${bodyShape}.` : '';
      const styleDescription = getCharacterArtStyleDescription(artStyle);
      
      const commonPrompt = [
        clothingDescription,
        poseDescription,
        expressionDescription,
        bodyShapeDescription
      ].filter(Boolean).join(' ');
      
      let prompt = '';
      if (artStyle === 'Photo Realistic') {
        prompt = `Stylize the person in this photo to be photorealistic, with these changes: ${commonPrompt}. It's important to keep their key facial features. The background should be plain and neutral, like a solid grey color.`;
      } else {
        prompt = `Stylize the person in this photo as a comic book character in the following style: ${styleDescription}. Please apply these changes: ${commonPrompt}. It's important to keep their key features from the photo. The background should be plain and neutral, like a solid grey color.`;
      }
      
      const responseBase64 = await transformImage(base64Data, prompt, mimeType);
      setGeneratedCharacter(responseBase64);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, artStyle, wardrobe, pose, expression, bodyShape]);

  const handleAddToLibrary = () => {
    if (generatedCharacter && characterName.trim()) {
        const characterPrompt = `A character based on an uploaded photo, in the style of ${artStyle}${wardrobe.trim() ? `, wearing: ${wardrobe}` : ''}. Body Shape: ${bodyShape}. Pose: ${pose || 'N/A'}. Expression: ${expression || 'N/A'}.`;
        onAddCharacter(generatedCharacter, characterPrompt, characterName.trim());
        setGeneratedCharacter(null);
        setUploadedImage(null);
        setWardrobe('');
        setPose('');
        setExpression('');
        setBodyShape('Default');
        setCharacterName('');
    }
  };


  return (
    <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <SparkleIcon className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-semibold">Create Character from Photo</h2>
      </div>
      <p className="text-slate-400 text-sm">Upload a photo of yourself to transform it into a comic book character in your chosen art style. The new character will be added to your library below.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Upload Area */}
        <div className="w-full aspect-square bg-zinc-950/50 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-zinc-800">
            {uploadedImage ? (
                <img src={uploadedImage} alt="Uploaded preview" className="w-full h-full object-contain" />
            ) : (
                <div className="text-center text-zinc-500 p-4">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                    <p>Upload a photo of yourself</p>
                </div>
            )}
        </div>

        {/* Generated Character Area */}
        <div className="w-full aspect-square bg-zinc-950 rounded-xl flex items-center justify-center overflow-hidden border border-zinc-700">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Spinner />
              <span>Stylizing...</span>
            </div>
          ) : generatedCharacter ? (
            <img src={`data:image/jpeg;base64,${generatedCharacter}`} alt="Generated Character" className="w-full h-full object-contain" />
          ) : (
            <p className="text-zinc-500 p-4 text-center">Your generated character will appear here.</p>
          )}
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/png, image/jpeg"
        className="hidden"
      />

      {generatedCharacter && (
        <div className="mt-2">
            <label htmlFor="photo-char-name" className="block text-sm font-medium text-slate-400 mb-1">
            Character Name <span className="text-red-400">*</span>
            </label>
            <input
                id="photo-char-name"
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Enter character name..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div>
            <label htmlFor="char-creator-wardrobe" className="block text-sm font-medium text-slate-400 mb-1">
            Wardrobe (Optional)
            </label>
            <input
                id="char-creator-wardrobe"
                type="text"
                value={wardrobe}
                onChange={(e) => setWardrobe(e.target.value)}
                placeholder="e.g., Red superhero cape"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                disabled={isLoading || !uploadedImage}
            />
        </div>
         <div>
            <label htmlFor="char-creator-pose" className="block text-sm font-medium text-slate-400 mb-1">
            Pose (Optional)
            </label>
            <input
                id="char-creator-pose"
                type="text"
                value={pose}
                onChange={(e) => setPose(e.target.value)}
                placeholder="e.g., Arms crossed"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                disabled={isLoading || !uploadedImage}
            />
        </div>
         <div>
            <label htmlFor="char-creator-expression" className="block text-sm font-medium text-slate-400 mb-1">
            Expression (Optional)
            </label>
            <input
                id="char-creator-expression"
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="e.g., Determined look"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                disabled={isLoading || !uploadedImage}
            />
        </div>
        <div>
            <label htmlFor="char-creator-body-shape" className="block text-sm font-medium text-slate-400 mb-1">
            Body Shape (Optional)
            </label>
             <select
                id="char-creator-body-shape"
                value={bodyShape}
                onChange={(e) => setBodyShape(e.target.value as BodyShape)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:outline-none h-full"
                disabled={isLoading || !uploadedImage}
            >
                {BODY_SHAPES_PHOTO.map(shape => <option key={shape.value} value={shape.value} className="bg-zinc-800">{shape.label}</option>)}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
         <button
          onClick={triggerFileUpload}
          className="bg-zinc-800 text-white font-semibold rounded-lg px-4 py-3 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
        >
          {uploadedImage ? 'Change Photo' : 'Upload Photo'}
        </button>
        <div className="">
          <select
            id="char-creator-art-style"
            value={artStyle}
            onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:outline-none h-full"
            disabled={isLoading || !uploadedImage}
          >
            {ART_STYLES.map(style => <option key={style.value} value={style.value} className="bg-zinc-800">{style.label}</option>)}
          </select>
        </div>
         {!generatedCharacter ? (
            <button
            onClick={handleGenerateClick}
            disabled={isLoading || !uploadedImage}
            className="bg-yellow-600 text-white font-semibold rounded-lg px-4 py-3 hover:bg-yellow-700 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
            {isLoading ? <Spinner /> : 'Generate Character'}
            </button>
        ) : (
            <button
            onClick={handleAddToLibrary}
            disabled={!characterName.trim()}
            className="bg-green-600 text-white font-semibold rounded-lg px-4 py-3 hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-zinc-700 disabled:cursor-not-allowed"
            >
            Add to Library
            </button>
        )}
      </div>
    </div>
  );
};

export default CharacterCreator;