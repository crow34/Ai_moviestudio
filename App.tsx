import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import CharacterStudio from './components/CharacterStudio';
import SceneStudio from './components/SceneStudio';
import SceneEditor from './components/SceneEditor';
import PropsStudio from './components/PropsStudio';
import { GeneratedImage, AspectRatio, ArtStyle, BodyShape, FilmType, PostFxType } from './types';
import { generateImage, compositeScene, getCharacterArtStyleDescription, getSceneArtStyleDescription, transformImage, generateVFXScene, applyFilmGrade, applyPostProcessingEffect, generateStoryboardPanels } from './services/geminiService';

export type View = 'character' | 'scene' | 'props' | 'editor';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('character');
  const [artStyle, setArtStyle] = useState<ArtStyle>('None');
  const [characters, setCharacters] = useState<GeneratedImage[]>([]);
  const [scenes, setScenes] = useState<GeneratedImage[]>([]);
  const [finalPanel, setFinalPanel] = useState<GeneratedImage | null>(null);
  const [propPanel, setPropPanel] = useState<{ originalSceneId: string; image: GeneratedImage } | null>(null);

  const [selectedCharacters, setSelectedCharacters] = useState<GeneratedImage[]>([]);
  const [selectedScene, setSelectedScene] = useState<GeneratedImage | null>(null);

  const [loadingStates, setLoadingStates] = useState({
    character: false,
    scene: false,
    editor: false,
    vfx: false,
    props: false,
    grading: false,
    postFx: false,
    storyboard: false,
  });

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
      console.error("Failed to generate character:", error);
      alert("Failed to generate character. Check the console for details.");
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
      console.error("Failed to generate scene:", error);
      alert("Failed to generate scene. Check the console for details.");
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
      setFinalPanel({ id: `final-${Date.now()}`, prompt: instructions, base64 });
    } catch (error) {
      console.error("Failed to composite scene:", error);
      alert("Failed to composite scene. Check the console for details.");
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
      setFinalPanel({ id: `final-${Date.now()}`, prompt: refinementPrompt, base64: refinedBase64 });
    } catch (error) {
       console.error("Failed to refine panel:", error);
      alert("Failed to refine panel. Check the console for details.");
    } finally {
      setLoadingStates(prev => ({...prev, editor: false}));
    }
  }, [finalPanel]);
  
  const handleGenerateVFXPanel = useCallback(async (vfxInstructions: string) => {
    const basePanel = finalPanel;
    if (!basePanel) {
      alert("Please generate a base panel first before adding VFX.");
      return;
    }
    setLoadingStates(prev => ({ ...prev, vfx: true }));
    try {
      const base64 = await generateVFXScene(basePanel.base64, vfxInstructions, artStyle);
      setFinalPanel({ id: `vfx-${Date.now()}`, prompt: vfxInstructions, base64 });
    } catch (error) {
      console.error("Failed to generate VFX panel:", error);
      alert("Failed to generate VFX panel. Check the console for details.");
    } finally {
      setLoadingStates(prev => ({ ...prev, vfx: false }));
    }
  }, [finalPanel, artStyle]);

  const handleApplyFilmGrade = useCallback(async (filmType: FilmType) => {
    const basePanel = finalPanel;
    if (!basePanel) {
      alert("Please generate a base panel first before applying a film grade.");
      return;
    }
    setLoadingStates(prev => ({ ...prev, grading: true }));
    try {
      const base64 = await applyFilmGrade(basePanel.base64, filmType);
      setFinalPanel({ id: `graded-${Date.now()}`, prompt: `Graded with ${filmType}`, base64 });
    } catch (error) {
      console.error("Failed to apply film grade:", error);
      alert("Failed to apply film grade. Check the console for details.");
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
      setFinalPanel({ id: `postfx-${Date.now()}`, prompt: `Effect applied: ${fxType}`, base64 });
    } catch (error) {
      console.error("Failed to apply post-processing effect:", error);
      alert("Failed to apply post-processing effect. Check the console for details.");
    } finally {
      setLoadingStates(prev => ({ ...prev, postFx: false }));
    }
  }, [finalPanel]);

  const handleAddPropToScene = useCallback(async (scene: GeneratedImage, propInstructions: string) => {
    setLoadingStates(prev => ({ ...prev, props: true }));
    setPropPanel(null);
    try {
      const prompt = `You are an expert digital artist and set dresser. Your task is to add a prop to the provided scene image.
        
**Instructions:**
1.  **Add the Prop:** Add the following prop to the scene: "${propInstructions}".
2.  **Seamless Integration:** The prop must be integrated seamlessly. This means it must match the scene's existing art style, lighting, shadows, color grading, and perspective. It should look like it was always part of the original image.
3.  **Preserve the Original:** Do not alter any other part of the original scene. Only add the requested prop.

**Final Output:** A single image of the scene with the new prop included.`;

      const base64 = await transformImage(scene.base64, prompt);
      const newImage = { id: `prop-scene-${Date.now()}`, prompt: `Scene with prop: ${propInstructions}`, base64 };
      setPropPanel({ originalSceneId: scene.id, image: newImage });
    } catch (error) {
      console.error("Failed to add prop to scene:", error);
      alert("Failed to add prop. Check console for details.");
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
        console.error("Failed to continue storyboard:", error);
        alert("Failed to continue storyboard. Check the console for details.");
    } finally {
        setLoadingStates(prev => ({ ...prev, storyboard: false }));
    }
  }, [finalPanel, artStyle, scenes]);

  const renderActiveView = () => {
    switch (activeView) {
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
       case 'props':
        return <PropsStudio
          scenes={scenes}
          onAddProp={handleAddPropToScene}
          onReplaceScene={handleReplaceSceneInLibrary}
          isLoading={loadingStates.props}
          propPanel={propPanel}
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
          onGenerateVFX={handleGenerateVFXPanel}
          isVFXLoading={loadingStates.vfx}
          onApplyFilmGrade={handleApplyFilmGrade}
          isGradingLoading={loadingStates.grading}
          onApplyPostFx={handleApplyPostFx}
          isPostFxLoading={loadingStates.postFx}
          onContinueStoryboard={handleContinueStoryboard}
          isStoryboardLoading={loadingStates.storyboard}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        artStyle={artStyle}
        setArtStyle={setArtStyle}
      />
      <main className="container mx-auto p-4 sm:p-8">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default App;