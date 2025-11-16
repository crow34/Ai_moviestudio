import React, { useState, useRef, useEffect } from 'react';
import VideoCameraIcon from './icons/VideoCameraIcon';
import Spinner from './Spinner';
import { getSceneArtStyleDescription, transformImage } from '../services/geminiService';
import { ArtStyle } from '../types';
import { ART_STYLES } from '../constants';
import SparkleIcon from './icons/SparkleIcon';

interface SceneCreatorFromCameraProps {
  onAddScene: (base64: string, prompt: string) => void;
}

const SceneCreatorFromCamera: React.FC<SceneCreatorFromCameraProps> = ({ onAddScene }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [artStyle, setArtStyle] = useState<ArtStyle>('None');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access the rear camera. Please ensure you have given permission and that a rear camera is available.");
        setIsCameraActive(false);
      }
    };

    if (isCameraActive) {
      startStream();
    }

    return () => {
      // Cleanup function to stop the stream when component unmounts or camera is deactivated
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isCameraActive]);

  const startCamera = () => {
    setCapturedImage(null);
    setIsCameraActive(true);
  };

  const stopCamera = () => {
    setIsCameraActive(false);
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
    stopCamera();
  };
  
  const handleStylizeAndAdd = async () => {
    if (!capturedImage) return;
    setIsLoading(true);
    try {
        const base64Data = capturedImage.split(',')[1];
        const mimeType = capturedImage.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';
        const styleDescription = getSceneArtStyleDescription(artStyle);
        
        let prompt = '';
        if (artStyle === 'Photo Realistic') {
            prompt = `Stylize this photo of a scene to look more dramatic and clean, while maintaining a photorealistic style suitable for a comic book background.`;
        } else {
            prompt = `Stylize this photo of a real-world scene as a comic book background in the following style: ${styleDescription}. The result should look like artwork that preserves the original composition, not just a filtered photo.`;
        }

        const stylizedBase64 = await transformImage(base64Data, prompt, mimeType);
        
        const finalPrompt = `A scene based on a captured photo, stylized as ${artStyle}.`;
        onAddScene(stylizedBase64, finalPrompt);

        setCapturedImage(null);
        setArtStyle('None');

    } catch(error) {
        alert((error as Error).message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCancel = () => {
    stopCamera();
    setCapturedImage(null);
  };

  if (isCameraActive) {
    return (
      <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6 flex flex-col gap-4 items-center">
        <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg rounded-md" />
        <div className="flex gap-4">
          <button onClick={handleCapture} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg px-6 py-2 hover:opacity-90 transition-opacity">Capture Scene</button>
          <button onClick={handleCancel} className="bg-zinc-800 text-white font-semibold rounded-lg px-6 py-2 hover:bg-zinc-700 transition-colors">Cancel</button>
        </div>
      </div>
    );
  }
  
  if (capturedImage) {
    return (
         <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <SparkleIcon className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-semibold">Stylize Captured Scene</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="w-full aspect-square bg-zinc-950/50 rounded-xl flex items-center justify-center overflow-hidden">
                    <img src={capturedImage} alt="Captured Scene" className="w-full h-full object-contain"/>
                </div>
                 <div className="w-full aspect-square bg-zinc-950 rounded-xl flex items-center justify-center overflow-hidden border border-zinc-700">
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Spinner />
                      <span>Stylizing...</span>
                    </div>
                  ) : (
                    <p className="text-zinc-500 p-4 text-center">Stylized scene will be added to your library.</p>
                  )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                    value={artStyle}
                    onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:outline-none h-full"
                    disabled={isLoading}
                >
                     {ART_STYLES.map(style => <option key={style.value} value={style.value} className="bg-zinc-800">{style.label}</option>)}
                </select>
                 <button
                    onClick={handleStylizeAndAdd}
                    disabled={isLoading}
                    className="bg-green-600 text-white font-semibold rounded-lg px-4 py-3 hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-zinc-700 disabled:cursor-not-allowed"
                    >
                    {isLoading ? <Spinner /> : 'Stylize and Add to Library'}
                </button>
            </div>
             <button onClick={handleCancel} disabled={isLoading} className="w-full bg-zinc-800 text-white font-semibold rounded-lg px-4 py-3 hover:bg-zinc-700 transition-colors disabled:bg-zinc-900">
                Discard
             </button>
         </div>
    )
  }

  return (
    <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6 flex flex-col gap-4">
         <div className="flex items-center gap-3">
            <VideoCameraIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold">Create Scene from Camera</h2>
        </div>
        <p className="text-slate-400 text-sm">Use your device's rear camera to capture a real-world location and turn it into a comic book scene.</p>
        <button
        onClick={startCamera}
        className="w-full bg-purple-600 text-white font-semibold rounded-lg px-4 py-3 hover:bg-purple-700 transition-colors flex items-center justify-center gap-3"
        >
        <VideoCameraIcon className="w-6 h-6" />
        Use Rear Camera
        </button>
    </div>
  );
};

export default SceneCreatorFromCamera;