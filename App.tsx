import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import CharacterStudio from './components/CharacterStudio';
import SceneStudio from './components/SceneStudio';
import SceneEditor from './components/SceneEditor';
import PropsStudio from './components/PropsStudio';
import VFXStudio from './components/VFXStudio';
import VideoLab from './components/VideoLab';
import PostProductionStudio from './components/PostProductionStudio';
import ScriptWritingStudio from './components/ScriptWritingStudio';
import ComicCoverCreator from './components/ComicCoverCreator';
import { GeneratedImage, AspectRatio, ArtStyle, BodyShape, FilmType, PostFxType, ComicSceneScript } from './types';
import { generateImage, compositeScene, getCharacterArtStyleDescription, getSceneArtStyleDescription, transformImage, generateVFXScene, applyFilmGrade, applyPostProcessingEffect, generateStoryboardPanels, generateVideoFromPanel, generateSpeech, generateComicScript, generateComicCover } from './services/geminiService';
import SettingsModal, { ApiSettings } from './components/SettingsModal';
import { CAMERA_PRESETS } from './constants';

export type View = 'home' | 'character' | 'scene' | 'props' | 'vfx' | 'editor' | 'video' | 'postproduction' | 'script' | 'cover';

// Helper to convert raw PCM audio data (base64) into a playable WAV blob URL.
const createWavBlobUrl = (base64Pcm: string): string => {
    // Decode base64
    const binaryString = window.atob(base64Pcm);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const sampleRate = 24000; // Gemini TTS standard sample rate
    const numChannels = 1;
    const bitsPerSample = 16;
    const dataSize = bytes.length;
    
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // byteRate
    view.setUint16(32, numChannels * (bitsPerSample / 8), true); // blockAlign
    view.setUint16(34, bitsPerSample, true);
    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write PCM data
    const pcmAsUint8 = new Uint8Array(bytes.buffer);
    for (let i = 0; i < pcmAsUint8.length; i++) {
        view.setUint8(44 + i, pcmAsUint8[i]);
    }

    const blob = new Blob([view], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
};


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('home');
  const [artStyle, setArtStyle] = useState<ArtStyle>('None');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Libraries
  const [characters, setCharacters] = useState<GeneratedImage[]>([]);
  const [scenes, setScenes] = useState<GeneratedImage[]>([]);
  
  // Scene Editor State
  const [finalPanel, setFinalPanel] = useState<GeneratedImage | null>(null);
  const [selectedCharacters, setSelectedCharacters] = useState<GeneratedImage[]>([]);
  const [selectedScene, setSelectedScene] = useState<GeneratedImage | null>(null);

  // Props Studio State
  const [propPanel, setPropPanel] = useState<{ originalSceneId: string; image: GeneratedImage } | null>(null);

  // VFX Studio State
  const [selectedCharacterForVFX, setSelectedCharacterForVFX] = useState<GeneratedImage | null>(null);
  const [selectedSceneForVFX, setSelectedSceneForVFX] = useState<GeneratedImage | null>(null);
  const [vfxPanel, setVfxPanel] = useState<GeneratedImage | null>(null);

  // Video Lab State
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [speechUrl, setSpeechUrl] = useState<string | null>(null);
  
  // Script Writing State
  const [script, setScript] = useState<ComicSceneScript[] | null>(null);

  // Cover Creator State
  const [coverImage, setCoverImage] = useState<GeneratedImage | null>(null);


  const [loadingStates, setLoadingStates] = useState({
    character: false,
    scene: false,
    editor: false,
    vfx: false,
    props: false,
    grading: false,
    postFx: false,
    storyboard: false,
    video: false,
    script: false,
    cover: false,
    conversation: false,
    actionShot: false,
    thoughtShot: false,
  });

  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('apiSettings');
      return savedSettings ? JSON.parse(savedSettings) : { useCustomKey: false, apiKey: '' };
    } catch {
      return { useCustomKey: false, apiKey: '' };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('apiSettings', JSON.stringify(apiSettings));
    } catch (error) {
      console.error("Could not save API settings to localStorage", error);
    }
  }, [apiSettings]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    const currentVideoUrl = videoUrl;
    const currentSpeechUrl = speechUrl;
    return () => {
        if (currentVideoUrl) {
            URL.revokeObjectURL(currentVideoUrl);
        }
        if (currentSpeechUrl) {
            URL.revokeObjectURL(currentSpeechUrl);
        }
    }
  }, [videoUrl, speechUrl]);


  const handleGenerateCharacter = useCallback(async (prompt: string, aspectRatio: AspectRatio, name: string, pose: string, expression: string, outfit: string, bodyShape: BodyShape) => {
    if (characters.length >= 4) {
      alert("You can only create up to 4 characters.");
      return;
    }
    setLoadingStates(prev => ({ ...prev, character: true }));
    try {
      const artStyleDescription = getCharacterArtStyleDescription(artStyle);
      
      const promptParts = [
        'Create a full-body character portrait for a comic book.',
        '',
        `**Character Name:** ${name}`,
        `**Character Description:** ${prompt}`,
      ];

      if (bodyShape !== 'Default') {
        promptParts.push(`**Body Type:** ${bodyShape}`);
      }

      promptParts.push(
        `**Outfit:** ${outfit.trim() ? outfit : 'As described in the character description.'}`,
        `**Pose:** ${pose.trim() ? pose : 'Neutral standing pose.'}`,
        `**Facial Expression:** ${expression.trim() ? expression : 'Neutral expression.'}`,
        '',
        `**Art Style:** The entire image must be rendered in the following style: ${artStyleDescription}.`,
        '',
        '**Background:** The background must be a plain, neutral, solid color (like light grey) to facilitate easy removal.',
        '',
        '**Important:** The character must be the sole focus, with no other objects or complex backgrounds. The character must be fully visible from head to toe.'
      );
      const styledPrompt = promptParts.join('\n');

      const base64 = await generateImage(styledPrompt, aspectRatio);
      const finalPrompt = `${prompt} (${name}) - Body: ${bodyShape}, Outfit: ${outfit || 'N/A'}, Pose: ${pose || 'N/A'}, Expression: ${expression || 'N/A'}`;
      const newCharacter = { id: `char-${Date.now()}`, prompt: finalPrompt, base64, name };
      setCharacters(prev => [...prev, newCharacter]);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoadingStates(prev => ({ ...prev, character: false }));
    }
  }, [characters, artStyle]);

  const handleAddCharacter = useCallback((base64: string, prompt: string, name: string) => {
    if (characters.length >= 4) {
      alert("Character library is full. You can't add more than 4 characters.");
      return;
    }
    const newCharacter = { id: `char-${Date.now()}`, prompt, base64, name };
    setCharacters(prev => [...prev, newCharacter]);
  }, [characters]);

  const handleImportCharacters = useCallback((importedCharacters: GeneratedImage[]) => {
    if (window.confirm('This will replace your current character library. Are you sure?')) {
      // Basic validation
      if (Array.isArray(importedCharacters) && importedCharacters.every(c => c.id && c.prompt && c.base64 && c.name)) {
        setCharacters(importedCharacters.slice(0, 4)); // Ensure max 4
      } else {
        alert('Invalid character file format.');
      }
    }
  }, []);

  const handleGenerateScene = useCallback(async (prompt: string, aspectRatio: AspectRatio) => {
    if (scenes.length >= 8) {
      alert("You can only create up to 8 scenes.");
      return;
    }
    setLoadingStates(prev => ({ ...prev, scene: true }));
    try {
      const artStyleDescription = getSceneArtStyleDescription(artStyle);
      const styledPrompt = `Create a comic book background scene.

**Scene Description:** ${prompt}

**Art Style:** The entire image must be rendered in the following style: ${artStyleDescription}.

The scene should be detailed and establish a clear mood and location, suitable for placing characters into later.`;
      const base64 = await generateImage(styledPrompt, aspectRatio);
      const newScene = { id: `scene-${Date.now()}`, prompt, base64 };
      setScenes(prev => [...prev, newScene]);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoadingStates(prev => ({ ...prev, scene: false }));
    }
  }, [scenes, artStyle]);
  
  const handleAddScene = useCallback((base64: string, prompt: string) => {
    if (scenes.length >= 8) {
      alert("Scene library is full. You can't add more than 8 scenes.");
      return;
    }
    const newScene = { id: `scene-${Date.now()}`, prompt, base64 };
    setScenes(prev => [...prev, newScene]);
  }, [scenes]);

  const handleImportScenes = useCallback((importedScenes: GeneratedImage[]) => {
    if (window.confirm('This will replace your current scene library. Are you sure?')) {
       if (Array.isArray(importedScenes) && importedScenes.every(s => s.id && s.prompt && s.base64)) {
        setScenes(importedScenes.slice(0, 8));
      } else {
        alert('Invalid scene file format.');
      }
    }
  }, []);

  const handleComposite = useCallback(async (instructions: string, aspectRatio: AspectRatio) => {
    if (selectedCharacters.length === 0 || !selectedScene) {
      alert("Please select at least one character and a scene first.");
      return;
    }
    setLoadingStates(prev => ({ ...prev, editor: true }));
    try {
      const base64 = await compositeScene(selectedScene.base64, selectedCharacters, instructions, artStyle, aspectRatio);
      const newPanel = { id: `final-${Date.now()}`, prompt: instructions, base64, name: `Generated Panel` };
      setFinalPanel(newPanel);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoadingStates(prev => ({ ...prev, editor: false }));
    }
  }, [selectedCharacters, selectedScene, artStyle]);
  
  const handleToggleCharacterSelection = (character: GeneratedImage) => {
    setSelectedCharacters(prev => {
      const isSelected = prev.some(c => c.id === character.id);
      if (isSelected) {
        return prev.filter(c => c.id !== character.id);
      } else {
        if (prev.length < 4) { // Limit to 4 characters
            return [...prev, character];
        }
        alert("You can select up to 4 characters for a scene.");
        return prev;
      }
    });
  };

  const handleRefinePanel = useCallback(async (refinementPrompt: string) => {
    const basePanel = finalPanel;
    if (!basePanel) {
      alert("Generate a panel first before refining.");
      return;
    }
    setLoadingStates(prev => ({...prev, editor: true}));
    try {
      const refinedBase64 = await transformImage(basePanel.base64, refinementPrompt);
      const newPanel = { ...basePanel, id: `final-${Date.now()}`, prompt: refinementPrompt, base64: refinedBase64, name: basePanel.name ? `${basePanel.name} (Refined)` : `Generated Panel` };
      setFinalPanel(newPanel);
    } catch (error) {
       alert((error as Error).message);
    } finally {
      setLoadingStates(prev => ({...prev, editor: false}));
    }
  }, [finalPanel]);
  
  const handleGenerateVFXPanel = useCallback(async (vfxInstructions: string, aspectRatio: AspectRatio) => {
    if (!selectedCharacterForVFX || !selectedSceneForVFX) {
      alert("Please select a character and a scene for the VFX Studio.");
      return;
    }
    setLoadingStates(prev => ({ ...prev, vfx: true }));
    setVfxPanel(null); // Clear previous panel
    try {
      const base64 = await generateVFXScene(
        selectedSceneForVFX.base64,
        selectedCharacterForVFX,
        vfxInstructions,
        artStyle,
        aspectRatio
      );
      const newVfxPanel = { id: `vfx-${Date.now()}`, prompt: vfxInstructions, base64, name: `VFX Panel` };
      setVfxPanel(newVfxPanel);
      setFinalPanel(newVfxPanel);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoadingStates(prev => ({ ...prev, vfx: false }));
    }
  }, [selectedCharacterForVFX, selectedSceneForVFX, artStyle]);


  const handleApplyFilmGrade = useCallback(async (filmType: FilmType) => {
    const basePanel = finalPanel;
    if (!basePanel) {
      alert("Please generate a base panel first before applying a film grade.");
      return;
    }
    setLoadingStates(prev => ({ ...prev, grading: true }));
    try {
      const base64 = await applyFilmGrade(basePanel.base64, filmType);
      const newPanel = { ...basePanel, id: `graded-${Date.now()}`, prompt: `Graded with ${filmType}`, base64, name: basePanel.name ? `${basePanel.name} (Graded)` : `Generated Panel` };
      setFinalPanel(newPanel);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoadingStates(prev => ({ ...prev, grading: false }));
    }
  }, [finalPanel]);

  const handleApplyPostFx = useCallback(async (fxType: PostFxType) => {
    const basePanel = finalPanel;
    if (!basePanel) {
      alert("Please generate a base panel first before applying an effect.");
      return;
    }
    setLoadingStates(prev => ({ ...prev, postFx: true }));
    try {
      const base64 = await applyPostProcessingEffect(basePanel.base64, fxType);
      const newPanel = { ...basePanel, id: `postfx-${Date.now()}`, prompt: `Effect applied: ${fxType}`, base64, name: basePanel.name ? `${basePanel.name} (FX)` : `Generated Panel` };
      setFinalPanel(newPanel);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoadingStates(prev => ({ ...prev, postFx: false }));
    }
  }, [finalPanel]);

  const handleAddPropToScene = useCallback(async (scene: GeneratedImage, propInstructions: string) => {
    setLoadingStates(prev => ({ ...prev, props: true }));
    setPropPanel(null);
    try {
      const prompt = `Add this prop to the scene: "${propInstructions}". The prop should match the scene's art style, lighting, and perspective. Please do not change any other part of the original image.`;

      const base64 = await transformImage(scene.base64, prompt);
      const newImage = { id: `prop-scene-${Date.now()}`, prompt: `Scene with prop: ${propInstructions}`, base64 };
      setPropPanel({ originalSceneId: scene.id, image: newImage });
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoadingStates(prev => ({ ...prev, props: false }));
    }
  }, []);

  const handleReplaceSceneInLibrary = useCallback((originalSceneId: string, newScene: GeneratedImage) => {
    setScenes(prevScenes => prevScenes.map(scene => 
      scene.id === originalSceneId ? { ...newScene, id: originalSceneId } : scene
    ));
    setPropPanel(null);
    alert("Scene has been updated in the library.");
  }, []);
  
  const handleContinueStoryboard = useCallback(async () => {
    if (!finalPanel) {
        alert("Please generate a final panel first.");
        return;
    }
    if (scenes.length + 4 > 8) {
        alert(`You need at least 4 empty slots in your scene library to continue the storyboard. You currently have ${8 - scenes.length} slots available.`);
        return;
    }

    setLoadingStates(prev => ({ ...prev, storyboard: true }));
    try {
        const panelDescriptions = await generateStoryboardPanels(finalPanel.base64, finalPanel.prompt, artStyle);
        
        const artStyleDescription = getSceneArtStyleDescription(artStyle);

        const newScenePromises = panelDescriptions.map(async (desc, index) => {
            const styledPrompt = `Create a comic book background scene.\n\n**Scene Description:** ${desc}\n\n**Art Style:** The entire image must be rendered in the following style: ${artStyleDescription}.\n\nThe scene should be detailed and establish a clear mood and location, suitable for placing characters into later.`;
            const base64 = await generateImage(styledPrompt, '16:9'); // Defaulting to 16:9 for story panels
            return { id: `scene-${Date.now()}-${index}`, prompt: desc, base64 };
        });

        const newScenes = await Promise.all(newScenePromises);
        setScenes(prev => [...prev, ...newScenes]);
        alert("Successfully generated 4 new scenes and added them to your Scene Library!");

    } catch (error) {
        alert((error as Error).message);
    } finally {
        setLoadingStates(prev => ({ ...prev, storyboard: false }));
    }
  }, [finalPanel, artStyle, scenes]);

  const handleGenerateScript = useCallback(async (prompt: string) => {
    setLoadingStates(prev => ({ ...prev, script: true }));
    setScript(null);
    try {
        const generatedScript = await generateComicScript(prompt);
        setScript(generatedScript);
    } catch (error) {
        alert((error as Error).message);
    } finally {
        setLoadingStates(prev => ({ ...prev, script: false }));
    }
  }, []);
  
  const handleGenerateConversationShot = useCallback(async (aspectRatio: AspectRatio) => {
    if (selectedCharacters.length === 0 || !selectedScene || !finalPanel) {
      alert("Please generate a panel and select characters/scene first.");
      return;
    }
    setLoadingStates(prev => ({ ...prev, conversation: true }));
    try {
      const conversationalAngleValues = ['medium', 'close-up', 'over-the-shoulder'];
      const randomAngleValue = conversationalAngleValues[Math.floor(Math.random() * conversationalAngleValues.length)];
      const preset = CAMERA_PRESETS.find(p => p.value === randomAngleValue);
      const angleInstruction = preset ? preset.instructionTemplate : `A ${randomAngleValue} shot.`;
      
      let speakerInstruction = 'Characters should have expressions suitable for a conversation (e.g., listening, speaking).';
      if (selectedCharacters.length > 0) {
          const speaker = selectedCharacters[Math.floor(Math.random() * selectedCharacters.length)];
          const listeners = selectedCharacters.filter(c => c.id !== speaker.id);
          
          speakerInstruction = `The main focus is a conversation. The character named "${speaker.name}" should appear to be speaking (e.g., mouth slightly open, expressive gesture).`;
          if (listeners.length > 0) {
              speakerInstruction += ` The other character(s) (${listeners.map(l => l.name).join(', ')}) should have actively listening expressions.`;
          }
      }

      const instructions = `Task: Generate a new panel for an ongoing conversation scene. Maintain consistency with the previous panel but change the camera and expressions for a dynamic dialogue sequence.

- **Scene & Characters:** Keep the same background, and the same characters (${selectedCharacters.map(c => c.name).join(', ')}) with their exact same outfits and appearances from their reference images.
- **Camera Angle:** The new panel MUST use a different camera angle suitable for dialogue. Use this specific angle: ${angleInstruction}.
- **Expressions:** ${speakerInstruction}
- **Continuity:** Ensure lighting, mood, and art style are consistent with the original scene.`;

      const base64 = await compositeScene(selectedScene.base64, selectedCharacters, instructions, artStyle, aspectRatio);
      const newPanel = { id: `conv-${Date.now()}`, prompt: instructions, base64, name: `Generated Panel` };
      setFinalPanel(newPanel);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoadingStates(prev => ({ ...prev, conversation: false }));
    }
  }, [selectedCharacters, selectedScene, finalPanel, artStyle]);

  const handleGenerateActionShot = useCallback(async (aspectRatio: AspectRatio) => {
    if (selectedCharacters.length === 0 || !selectedScene || !finalPanel) {
        alert("Please generate a panel and select characters/scene first.");
        return;
    }
    setLoadingStates(prev => ({ ...prev, actionShot: true }));
    try {
        const actionAngleValues = ['dutch', 'worms-eye', 'long', 'close-up'];
        const randomAngleValue = actionAngleValues[Math.floor(Math.random() * actionAngleValues.length)];
        const preset = CAMERA_PRESETS.find(p => p.value === randomAngleValue || p.angle === randomAngleValue);
        const angleInstruction = preset ? preset.instructionTemplate : `An action-oriented ${randomAngleValue} shot.`;
        
        let actionInstruction = 'Characters should be in dynamic, action-oriented poses, with intense or determined expressions.';
        if (selectedCharacters.length > 0) {
            const mainCharacter = selectedCharacters[Math.floor(Math.random() * selectedCharacters.length)];
            actionInstruction = `The main focus is an action sequence. The character named "${mainCharacter.name}" should be performing a key action (e.g., running, jumping, fighting). Other characters should be reacting appropriately to the action. Poses should be dynamic and full of motion.`;
        }

        const instructions = `Task: Generate a new panel for an ongoing action scene. Maintain consistency with the previous panel but change the camera and poses for a dynamic action sequence.

- **Scene & Characters:** Keep the same background, and the same characters (${selectedCharacters.map(c => c.name).join(', ')}) with their exact same outfits and appearances from their reference images.
- **Camera Angle:** The new panel MUST use a different camera angle suitable for action. Use this specific angle: ${angleInstruction}.
- **Action & Poses:** ${actionInstruction}
- **Continuity:** Ensure lighting, mood, and art style are consistent with the original scene. Add motion blur or speed lines if appropriate for the action.`;

        const base64 = await compositeScene(selectedScene.base64, selectedCharacters, instructions, artStyle, aspectRatio);
        const newPanel = { id: `action-${Date.now()}`, prompt: instructions, base64, name: `Generated Panel` };
        setFinalPanel(newPanel);
    } catch (error) {
        alert((error as Error).message);
    } finally {
        setLoadingStates(prev => ({ ...prev, actionShot: false }));
    }
  }, [selectedCharacters, selectedScene, finalPanel, artStyle]);

  const handleGenerateThoughtShot = useCallback(async (aspectRatio: AspectRatio) => {
      if (selectedCharacters.length === 0 || !selectedScene || !finalPanel) {
          alert("Please generate a panel and select characters/scene first.");
          return;
      }
      setLoadingStates(prev => ({ ...prev, thoughtShot: true }));
      try {
          const thoughtAngleValues = ['close-up', 'medium'];
          const randomAngleValue = thoughtAngleValues[Math.floor(Math.random() * thoughtAngleValues.length)];
          const preset = CAMERA_PRESETS.find(p => p.value === randomAngleValue);
          const angleInstruction = preset ? preset.instructionTemplate : `A ${randomAngleValue} shot.`;
          
          let thoughtInstruction = 'The character should have a pensive, thoughtful, or internal expression.';
          if (selectedCharacters.length > 0) {
              const mainCharacter = selectedCharacters[0];
              thoughtInstruction = `The main focus is on the internal thoughts of the character "${mainCharacter.name}". Their expression should be pensive, worried, or determined. Optionally, you can add a thought bubble above their head. The background can be slightly out of focus to emphasize their internal state.`;
          }

          const instructions = `Task: Generate a new panel showing a character's internal thoughts. Maintain consistency with the previous panel but change the camera and expression to focus on their mental state.

- **Scene & Characters:** Keep the same background (or a stylized/blurred version of it) and the same character(s) (${selectedCharacters.map(c => c.name).join(', ')}) with their exact same outfits and appearances.
- **Camera Angle:** The new panel MUST use a camera angle suitable for introspection. Use this specific angle: ${angleInstruction}.
- **Expression & Mood:** ${thoughtInstruction}
- **Continuity:** Ensure lighting, mood, and art style are consistent with the original scene, but with a clear focus on the character's internal world.`;

          const base64 = await compositeScene(selectedScene.base64, selectedCharacters, instructions, artStyle, aspectRatio);
          const newPanel = { id: `thought-${Date.now()}`, prompt: instructions, base64, name: `Generated Panel` };
          setFinalPanel(newPanel);
      } catch (error) {
          alert((error as Error).message);
      } finally {
          setLoadingStates(prev => ({ ...prev, thoughtShot: false }));
      }
  }, [selectedCharacters, selectedScene, finalPanel, artStyle]);


  const handleGenerateVideoAndAudio = useCallback(async (
      animationPrompt: string, 
      dialogue: string, 
      aspectRatio: AspectRatio, 
      onProgress: (message: string) => void
    ) => {
    if (!finalPanel) {
      alert("Please generate a final panel in the editor first.");
      return;
    }
    setLoadingStates(prev => ({ ...prev, video: true }));
    setVideoUrl(null);
    setSpeechUrl(null);

    try {
      const videoPromise = generateVideoFromPanel(finalPanel.base64, animationPrompt, aspectRatio, onProgress);
      const speechPromise = dialogue.trim() ? generateSpeech(dialogue) : Promise.resolve(null);
      
      const [videoBlob, speechBase64] = await Promise.all([videoPromise, speechPromise]);
      
      onProgress("Finishing up...");

      if (videoBlob) {
        const videoObjectURL = URL.createObjectURL(videoBlob);
        setVideoUrl(videoObjectURL);
      }
      if (speechBase64) {
        const speechObjectURL = createWavBlobUrl(speechBase64);
        setSpeechUrl(speechObjectURL);
      }
    } catch (error) {
      alert((error as Error).message);
      // Re-throw so the component can handle UI state changes (like API key prompt)
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, video: false }));
    }
  }, [finalPanel]);

  const handleGenerateCover = useCallback(async (
    background: GeneratedImage,
    characters: GeneratedImage[],
    title: string,
    subtitle: string,
    author: string,
    aspectRatio: AspectRatio,
    genre: string
  ) => {
    setLoadingStates(prev => ({ ...prev, cover: true }));
    setCoverImage(null);
    try {
      const base64 = await generateComicCover(background, characters, title, subtitle, author, artStyle, aspectRatio, genre);
      const newCover = { id: `cover-${Date.now()}`, prompt: `Cover for ${title}`, base64, name: `Cover: ${title}` };
      setCoverImage(newCover);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoadingStates(prev => ({ ...prev, cover: false }));
    }
  }, [artStyle]);


  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return <Home setActiveView={setActiveView} />;
      case 'character':
        return <CharacterStudio
          characters={characters}
          onGenerate={handleGenerateCharacter}
          onAddCharacter={handleAddCharacter}
          onImport={handleImportCharacters}
          isLoading={loadingStates.character}
        />;
      case 'scene':
        return <SceneStudio
          scenes={scenes}
          onGenerate={handleGenerateScene}
          onAddScene={handleAddScene}
          onImport={handleImportScenes}
          isLoading={loadingStates.scene}
        />;
      case 'script':
        return <ScriptWritingStudio
          onGenerate={handleGenerateScript}
          isLoading={loadingStates.script}
          script={script}
          setActiveView={setActiveView}
        />;
       case 'props':
        return <PropsStudio
          scenes={scenes}
          onAddProp={handleAddPropToScene}
          onReplaceScene={handleReplaceSceneInLibrary}
          isLoading={loadingStates.props}
          propPanel={propPanel}
        />;
      case 'vfx':
        return <VFXStudio
          characters={characters}
          scenes={scenes}
          selectedCharacter={selectedCharacterForVFX}
          selectedScene={setSelectedSceneForVFX}
          onSelectCharacter={setSelectedCharacterForVFX}
          onSelectScene={setSelectedSceneForVFX}
          onGenerate={handleGenerateVFXPanel}
          isLoading={loadingStates.vfx}
          vfxPanel={vfxPanel}
        />;
      case 'editor':
        return <SceneEditor
          characters={characters}
          scenes={scenes}
          selectedCharacters={selectedCharacters}
          selectedScene={selectedScene}
          onToggleCharacterSelection={handleToggleCharacterSelection}
          onSelectScene={setSelectedScene}
          onComposite={handleComposite}
          onRefine={handleRefinePanel}
          isLoading={loadingStates.editor}
          finalPanel={finalPanel}
          onApplyFilmGrade={handleApplyFilmGrade}
          isGradingLoading={loadingStates.grading}
          onApplyPostFx={handleApplyPostFx}
          isPostFxLoading={loadingStates.postFx}
          onContinueStoryboard={handleContinueStoryboard}
          isStoryboardLoading={loadingStates.storyboard}
          onGenerateConversationShot={handleGenerateConversationShot}
          isConversationLoading={loadingStates.conversation}
          onGenerateActionShot={handleGenerateActionShot}
          isActionShotLoading={loadingStates.actionShot}
          onGenerateThoughtShot={handleGenerateThoughtShot}
          isThoughtShotLoading={loadingStates.thoughtShot}
          setActiveView={setActiveView}
        />;
      case 'video':
        return <VideoLab
          finalPanel={finalPanel}
          onGenerate={handleGenerateVideoAndAudio}
          isLoading={loadingStates.video}
          videoUrl={videoUrl}
          speechUrl={speechUrl}
          setActiveView={setActiveView}
        />;
      case 'postproduction':
        return <PostProductionStudio />;
      case 'cover':
        return <ComicCoverCreator
          characters={characters}
          scenes={scenes}
          onGenerate={handleGenerateCover}
          isLoading={loadingStates.cover}
          coverImage={coverImage}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        artStyle={artStyle}
        setArtStyle={setArtStyle}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <main className="container mx-auto p-4 sm:p-8">
        {renderActiveView()}
      </main>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={apiSettings}
        onSave={setApiSettings}
      />
    </div>
  );
};

export default App;