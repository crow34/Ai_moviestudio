import React, { useState, useRef, useCallback, useEffect } from 'react';
import ScissorsIcon from './icons/ScissorsIcon';
import UploadIcon from './icons/UploadIcon';
import DownloadIcon from './icons/DownloadIcon';
import Spinner from './Spinner';

const PostProductionStudio: React.FC = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [extractedFrame, setExtractedFrame] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentVideoSrc = videoSrc;
    return () => {
        if (currentVideoSrc) {
            URL.revokeObjectURL(currentVideoSrc);
        }
    }
  }, [videoSrc]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setExtractedFrame(null);
      setError(null);
    } else {
      setError("Please select a valid video file.");
    }
    event.target.value = ''; // Allow re-uploading the same file
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const extractFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsLoading(true);
    setExtractedFrame(null);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
        setError("Could not get canvas context.");
        setIsLoading(false);
        return;
    }

    const onSeeked = () => {
        try {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const frameDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            setExtractedFrame(frameDataUrl);
        } catch (e) {
            console.error("Error extracting frame:", e);
            setError("Failed to extract frame. The video format might not be supported by your browser for canvas drawing.");
        } finally {
            setIsLoading(false);
            video.removeEventListener('seeked', onSeeked);
            video.removeEventListener('error', onError);
        }
    };

    const onError = (e: Event) => {
        console.error("Video error:", e);
        setError("An error occurred while processing the video.");
        setIsLoading(false);
        video.removeEventListener('seeked', onSeeked);
        video.removeEventListener('error', onError);
    };

    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    
    if (isNaN(video.duration)) {
        const onLoadedMetadata = () => {
            video.currentTime = video.duration;
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
        }
        video.addEventListener('loadedmetadata', onLoadedMetadata);
    } else {
        video.currentTime = video.duration;
    }
  }, []);

  const handleDownload = () => {
    if (!extractedFrame) return;
    const link = document.createElement('a');
    link.href = extractedFrame;
    link.download = `last_frame_${Date.now()}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <ScissorsIcon className="w-8 h-8 text-cyan-400" />
          <h2 className="text-2xl font-semibold">Post-Production: Frame Extractor</h2>
        </div>
        <p className="text-slate-400 text-sm">
          Upload a video to extract its final frame. This is useful for creating a seamless starting point for video-to-video generation or extending an existing animation.
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
        />

        {!videoSrc && (
          <button
            onClick={triggerFileUpload}
            className="w-full bg-cyan-600/80 text-white font-semibold rounded-lg px-4 py-3 hover:bg-cyan-700 transition-colors flex items-center justify-center gap-3"
          >
            <UploadIcon className="w-6 h-6" />
            Upload Video
          </button>
        )}
        
        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg text-sm">
                {error}
            </div>
        )}

        {videoSrc && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Video Player */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">1. Your Video</h3>
              <video
                ref={videoRef}
                src={videoSrc}
                controls
                className="w-full rounded-lg bg-black"
                onLoadedMetadata={e => e.currentTarget.currentTime = 0} // Start at beginning for preview
              />
              <button
                onClick={extractFrame}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-semibold rounded-lg px-4 py-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
              >
                {isLoading ? <Spinner /> : 'Extract Last Frame'}
              </button>
            </div>

            {/* Extracted Frame */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">2. Extracted Frame</h3>
              <div className="w-full aspect-video bg-zinc-950 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-700">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Spinner />
                        <span>Extracting...</span>
                    </div>
                ) : extractedFrame ? (
                  <img src={extractedFrame} alt="Extracted frame" className="w-full h-full object-contain" />
                ) : (
                  <p className="text-slate-500 p-4 text-center">The last frame will appear here.</p>
                )}
              </div>
               <button
                onClick={handleDownload}
                disabled={!extractedFrame}
                className="w-full bg-blue-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-zinc-700 disabled:cursor-not-allowed"
              >
                <DownloadIcon className="w-5 h-5" />
                Save as JPEG
              </button>
            </div>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default PostProductionStudio;
