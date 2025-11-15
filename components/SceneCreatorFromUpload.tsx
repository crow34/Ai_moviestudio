import React, { useState, useRef } from 'react';
import Spinner from './Spinner';
import { getSceneArtStyleDescription, transformImage } from '../services/geminiService';
import { ArtStyle } from '../types';
import { ART_STYLES } from '../constants';
import UploadIcon from './icons/UploadIcon';

interface SceneCreatorFromUploadProps {
  onAddScene: (base64: string, prompt: string) => void;
}

const SceneCreatorFromUpload: React.FC<SceneCreatorFromUploadProps> = ({ onAddScene }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [artStyle, setArtStyle] = useState<ArtStyle>('None');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleStylizeAndAdd = async () => {
    if (!uploadedImage) return;
    setIsLoading(true);
    try {
        const base64Data = uploadedImage.split(',')[1];
        const mimeType = uploadedImage.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';
        const styleDescription = getSceneArtStyleDescription(artStyle);
        
        let prompt = '';
        if (artStyle === 'Photo Realistic') {
            prompt = `This is a photo of a real-world scene. Enhance it to be more dramatic and clean, like a high-resolution photograph suitable for a comic book background. Maintain photorealism.`;
        } else {
            prompt = `You are an expert digital artist specializing in transforming real-world photos into stylized comic book art.
**Task:** Convert the provided photo of a real-world scene into a comic book background.
**Input:** [Image 1] is the source photo.
**Primary Objective: Art Style Conversion:** Your most important task is to completely redraw the input photo in the specified art style. The final image must NOT look like a filtered photo; it must be a fully rendered piece of artwork in the target style.
**Art Style Requirement:** The entire image MUST be rendered in the following style: ${styleDescription}.
**Secondary Objective: Maintain Composition:** While redrawing, preserve the core composition, objects, and layout of the original photo. The final image should be clearly recognizable as the same scene, but in the new art style.`;
        }

        const stylizedBase64 = await transformImage(base64Data, prompt, mimeType);
        
        const finalPrompt = `A scene based on an uploaded photo, stylized as ${artStyle}.`;
        onAddScene(stylizedBase64, finalPrompt);

        setUploadedImage(null);
        setArtStyle('None');

    } catch(error) {
        console.error("Failed to stylize scene:", error);
        alert("Failed to stylize scene. Check console for details.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUploadedImage(null);
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <UploadIcon className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-semibold">Create Scene from Upload</h2>
      </div>
      <p className="text-slate-400 text-sm">Upload a picture to use as a base for a comic book scene. It will be stylized and added to your library.</p>
      
      {uploadedImage ? (
         <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="w-full aspect-square bg-slate-700/50 rounded-md flex items-center justify-center overflow-hidden">
                    <img src={uploadedImage} alt="Uploaded Scene" className="w-full h-full object-contain"/>
                </div>
                 <div className="w-full aspect-square bg-slate-900 rounded-md flex items-center justify-center overflow-hidden border border-slate-700">
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Spinner />
                      <span>Stylizing...</span>
                    </div>
                  ) : (
                    <p className="text-slate-500 p-4 text-center">Stylized scene will be added to your library.</p>
                  )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                    value={artStyle}
                    onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:outline-none h-full"
                    disabled={isLoading}
                >
                     {ART_STYLES.map(style => <option key={style.value} value={style.value} className="bg-slate-800">{style.label}</option>)}
                </select>
                 <button
                    onClick={handleStylizeAndAdd}
                    disabled={isLoading}
                    className="bg-green-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                    {isLoading ? <Spinner /> : 'Stylize and Add to Library'}
                </button>
            </div>
             <button onClick={handleCancel} disabled={isLoading} className="w-full bg-slate-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-slate-700 transition-colors disabled:bg-slate-800">
                Discard
             </button>
         </div>
      ) : (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/png, image/jpeg"
                className="hidden"
            />
            <button
                onClick={triggerFileUpload}
                className="w-full bg-purple-600/80 text-white font-semibold rounded-md px-4 py-3 hover:bg-purple-700 transition-colors flex items-center justify-center gap-3"
            >
                <UploadIcon className="w-6 h-6" />
                Upload Image
            </button>
        </>
      )}
    </div>
  );
};

export default SceneCreatorFromUpload;
