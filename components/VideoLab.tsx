import React, { useState, useEffect, useRef } from 'react';
import { GeneratedImage, AspectRatio } from '../types';
import { View } from '../App';
import Spinner from './Spinner';
import VideoIcon from './icons/VideoIcon';
import SparkleIcon from './icons/SparkleIcon';
import { VEO_ASPECT_RATIOS, BACKGROUND_MUSIC_OPTIONS } from '../constants';
import InfoIcon from './icons/InfoIcon';

interface VideoLabProps {
  finalPanel: GeneratedImage | null;
  onGenerate: (animationPrompt: string, dialogue: string, aspectRatio: AspectRatio, onProgress: (message: string) => void) => Promise<void>;
  isLoading: boolean;
  videoUrl: string | null;
  speechUrl: string | null;
  setActiveView: (view: View) => void;
}

const loadingMessages = [
    "Warming up the digital cameras...",
    "Directing the virtual actors...",
    "Rendering the scene frame by frame...",
    "Adding cinematic magic...",
    "This can take a few minutes, hang tight!",
    "Processing advanced visual effects...",
    "Syncing audio and video streams...",
];

const VideoLab: React.FC<VideoLabProps> = ({ finalPanel, onGenerate, isLoading, videoUrl, speechUrl, setActiveView }) => {
    const [animationPrompt, setAnimationPrompt] = useState('');
    const [dialogue, setDialogue] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [bgMusic, setBgMusic] = useState('none');
    const [apiKeyReady, setApiKeyReady] = useState(false);
    const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);
    const [progressMessage, setProgressMessage] = useState('');
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const speechRef = useRef<HTMLAudioElement>(null);
    const musicRef = useRef<HTMLAudioElement>(null);
    
    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                setIsCheckingApiKey(true);
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeyReady(hasKey);
                setIsCheckingApiKey(false);
            } else {
                // Fallback for environments where aistudio is not available
                setIsCheckingApiKey(false);
                setApiKeyReady(true);
            }
        };
        checkKey();
    }, []);
    
    useEffect(() => {
        let interval: number;
        if (isLoading) {
            setProgressMessage(loadingMessages[0]);
            interval = window.setInterval(() => {
                setProgressMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 3000);
        } else {
             setProgressMessage('');
        }
        return () => clearInterval(interval);
    }, [isLoading]);


    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            setApiKeyReady(true);
        } else {
            alert("API Key selection is not available in this environment.");
        }
    };
    
    const handleGenerate = async () => {
        try {
            await onGenerate(animationPrompt, dialogue, aspectRatio, (msg) => setProgressMessage(msg));
        } catch (error) {
            if ((error as Error).message.includes("API key not found or invalid")) {
                setApiKeyReady(false);
            }
            // Error is alerted in App.tsx
        }
    };

    const syncPlay = () => {
        if (!speechRef.current?.paused) speechRef.current.pause();
        if (!musicRef.current?.paused) musicRef.current.pause();

        if (videoRef.current) {
            const time = videoRef.current.currentTime;
            if (speechRef.current) {
                speechRef.current.currentTime = time;
                speechRef.current.play();
            }
            if (musicRef.current) {
                musicRef.current.currentTime = time;
                musicRef.current.play();
            }
        }
    };
    const syncPause = () => {
        speechRef.current?.pause();
        musicRef.current?.pause();
    };
     const syncSeek = () => {
        if (videoRef.current) {
            const time = videoRef.current.currentTime;
            if (speechRef.current) speechRef.current.currentTime = time;
            if (musicRef.current) musicRef.current.currentTime = time;
        }
    };

    if (!finalPanel) {
        return (
             <div className="text-center py-20 bg-zinc-900/50 border border-zinc-700 rounded-2xl">
                <VideoIcon className="w-16 h-16 mx-auto text-rose-400" />
                <h2 className="mt-4 text-2xl font-semibold text-slate-100">Video Lab is Empty</h2>
                <p className="mt-2 text-slate-400">Please generate a final panel in the Scene Editor first.</p>
                <button onClick={() => setActiveView('editor')} className="mt-6 bg-rose-600 text-white font-semibold rounded-lg px-6 py-3 hover:bg-rose-700 transition-colors">
                    Go to Scene Editor
                </button>
            </div>
        );
    }
    
    if (isCheckingApiKey) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner />
                <span className="ml-4 text-slate-300">Checking API key status...</span>
            </div>
        );
    }

    if (!apiKeyReady) {
        return (
            <div className="text-center py-20 bg-zinc-900/50 border border-zinc-700 rounded-2xl">
                <h2 className="text-2xl font-semibold text-slate-100">API Key Required for Video Generation</h2>
                <p className="mt-2 text-slate-400 max-w-xl mx-auto">
                    The Veo model requires you to select your own Gemini API key for video generation. Billing will be associated with your account.
                </p>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mt-2 inline-block">
                    Learn more about billing
                </a>
                <div className="mt-6">
                    <button onClick={handleSelectKey} className="bg-blue-600 text-white font-semibold rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors">
                        Select API Key
                    </button>
                </div>
            </div>
        );
    }

    const aspectRatioClass = aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]';

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6 flex flex-col gap-4 h-full">
                <div className="flex items-center gap-3">
                    <VideoIcon className="w-8 h-8 text-rose-400" />
                    <h2 className="text-2xl font-semibold">Video Lab</h2>
                </div>
                 <div className="flex items-center gap-2 bg-zinc-800/50 p-3 rounded-lg text-sm text-slate-400">
                    <SparkleIcon className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <span>Using Veo to animate your panel and TTS for dialogue.</span>
                </div>
                <div>
                    <label htmlFor="anim-prompt" className="block text-sm font-medium text-slate-400 mb-1">Animation Prompt</label>
                    <textarea id="anim-prompt" value={animationPrompt} onChange={e => setAnimationPrompt(e.target.value)}
                        placeholder="e.g., The character slowly looks up, eyes widening in surprise. A gentle breeze rustles the leaves in the background."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                        rows={4} disabled={isLoading} />
                </div>
                <div>
                    <label htmlFor="dialogue" className="block text-sm font-medium text-slate-400 mb-1">Dialogue (Optional)</label>
                    <textarea id="dialogue" value={dialogue} onChange={e => setDialogue(e.target.value)}
                        placeholder="e.g., What was that?"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                        rows={2} disabled={isLoading} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="aspect-ratio" className="block text-sm font-medium text-slate-400 mb-1">Aspect Ratio</label>
                        <select id="aspect-ratio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as AspectRatio)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            disabled={isLoading}>
                           {VEO_ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="bg-music" className="block text-sm font-medium text-slate-400 mb-1">Background Music</label>
                        <select id="bg-music" value={bgMusic} onChange={e => setBgMusic(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            disabled={isLoading}>
                           {BACKGROUND_MUSIC_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>
                 <button onClick={handleGenerate} disabled={isLoading || !animationPrompt.trim()}
                    className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold rounded-lg px-4 py-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 mt-auto">
                    {isLoading ? <Spinner /> : 'Generate Video'}
                </button>
            </div>
            
            {/* Preview */}
            <div className="space-y-4">
                 <div className={`relative ${aspectRatioClass} w-full bg-zinc-950 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-700`}>
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-3 text-slate-400 text-center p-4">
                            <Spinner />
                            <span>{progressMessage}</span>
                        </div>
                    ) : videoUrl ? (
                         <>
                            <video ref={videoRef} src={videoUrl} controls className="w-full h-full object-contain" onPlay={syncPlay} onPause={syncPause} onSeeked={syncSeek} />
                            {speechUrl && <audio ref={speechRef} src={speechUrl} />}
                            {bgMusic !== 'none' && <audio ref={musicRef} src={bgMusic} loop />}
                         </>
                    ) : (
                        <img src={`data:image/jpeg;base64,${finalPanel.base64}`} alt="Final Panel Preview" className="w-full h-full object-contain" />
                    )}
                 </div>
                 <div className="flex items-start gap-3 bg-zinc-900/70 p-4 rounded-xl border border-zinc-700">
                    <InfoIcon className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-semibold text-slate-200">Playback Tip</h4>
                        <p className="text-sm text-slate-400">Use the video controls to play, pause, and seek. The dialogue and background music will automatically sync with the video playback.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoLab;
