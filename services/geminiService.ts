import { GoogleGenAI, Modality, Type } from "@google/genai";
import { AspectRatio, ArtStyle, GeneratedImage, FilmType, PostFxType, ComicSceneScript } from "../types";

const getApiKey = (): string => {
    try {
        const settingsString = localStorage.getItem('apiSettings');
        if (settingsString) {
            const settings = JSON.parse(settingsString);
            if (settings.useCustomKey && settings.apiKey) {
                return settings.apiKey;
            }
        }
    } catch (e) {
        console.error("Could not parse API settings from localStorage", e);
    }
    
    // Fallback to environment key
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key is not configured. Please add your own key in the Settings menu.");
    }
    return apiKey;
};

const getGoogleGenAI = () => {
    const apiKey = getApiKey();
    return new GoogleGenAI({ apiKey });
};

const getVeoApiKey = (): string => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        // This specific error is important for the VideoLab UI to react to
        throw new Error("API key not found or invalid.");
    }
    return apiKey;
};

const getVeoGoogleGenAI = () => {
    const apiKey = getVeoApiKey();
    return new GoogleGenAI({ apiKey });
};


const handleApiError = (error: unknown, context: string): never => {
  console.error(`Error during ${context}:`, error);

  let usingCustomKey = false;
  try {
    const settingsString = localStorage.getItem('apiSettings');
    if (settingsString) {
      const settings = JSON.parse(settingsString);
      if (settings.useCustomKey && settings.apiKey) {
        usingCustomKey = true;
      }
    }
  } catch {}

  if (error instanceof Error && error.message) {
    // The Gemini API often returns a JSON string within the error message.
    // We try to extract and parse it to provide a more specific error.
    const jsonMatch = error.message.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const errorBody = JSON.parse(jsonMatch[0]);
        if (errorBody.error) {
          const { status, message: apiMessage } = errorBody.error;
          if (status === 'RESOURCE_EXHAUSTED' || (apiMessage && apiMessage.includes('rate limit'))) {
            const customKeyMessage = usingCustomKey ? "Please check your custom API key's quota and billing details." : "You can try adding your own API key in the Settings menu to bypass this limit.";
            const friendlyMessage = `API Quota Exceeded: You've used up your current quota. ${customKeyMessage}

- Rate Limits Info: https://ai.google.dev/gemini-api/docs/rate-limits
- Check Usage: https://ai.dev/usage?tab=rate-limit`;
            throw new Error(friendlyMessage);
          }
          if (apiMessage && (apiMessage.includes('API key not found') || apiMessage.includes('Requested entity was not found'))) {
              if (context === 'video generation') {
                throw new Error(`API key not found or invalid. Please select your key again in the Video Lab. Error: ${apiMessage}`);
              }
              throw new Error(`Your custom API key was not found or is invalid. Please check it in the Settings menu. Error: ${apiMessage}`);
          }
          // Use the specific message from the API if available
          throw new Error(`API Error during ${context}: ${apiMessage}`);
        }
      } catch (e) {
        // Parsing failed, fall through to throw the original error message below.
      }
    }
    // If no JSON is found or parsing fails, throw the original error.
    throw error;
  }
  // Fallback for non-Error objects or errors without messages
  throw new Error(`An unknown error occurred during ${context}.`);
};

export const getCharacterArtStyleDescription = (artStyle: ArtStyle): string => {
  switch (artStyle) {
    case 'Frank Miller':
      return 'a gritty, high-contrast, black-and-white noir visual style with minimal color and heavy shadows, reminiscent of Frank Miller.';
    case 'Jack Kirby':
      return 'a style with dynamic action poses, bold outlines, cosmic energy effects ("Kirby Krackle"), and blocky, powerful figures, reminiscent of Jack Kirby.';
    case 'Creepshow':
      return 'a pulpy and macabre horror comic art style with saturated colors, ben-day dots, and dramatic, spooky lighting, reminiscent of Creepshow comics.';
    case 'Photo Realistic':
      return 'a hyper-realistic, photorealistic style with natural lighting, detailed textures, and lifelike features, as if it were a high-resolution photograph.';
    case 'Pixar':
      return 'a vibrant and charming 3D animated style with soft lighting, expressive features, and slightly exaggerated proportions, reminiscent of Pixar animation.';
    case 'Don Bluth':
      return 'a classic 2D animation style with expressive features, dramatic backlighting, and rich, saturated colors, reminiscent of Don Bluth films. Characters should have a hand-drawn feel with fluid lines and emotive expressions.';
    case 'The Simpsons':
      return 'a 2D animation style with yellow skin, large circular eyes with black dot pupils, a noticeable overbite, and four-fingered hands, reminiscent of The Simpsons. The character design should be simple with bold outlines.';
    case 'South Park':
      return 'a very simple and crude 2D cutout animation style, as if made from construction paper. The character should be composed of basic geometric shapes with minimal detail and limited animation poses, reminiscent of South Park.';
    case 'Anime / Manga':
      return 'a vibrant Japanese anime/manga style with clean, sharp line art, large expressive eyes, detailed and often colorful hair, and cel-shaded coloring. The character should have proportions typical of modern anime.';
    case 'None':
    default:
      return 'a modern, clean, and dynamic comic book art style with clear lines and vibrant colors.';
  }
};

export const getSceneArtStyleDescription = (artStyle: ArtStyle): string => {
  switch (artStyle) {
    case 'Frank Miller':
      return 'a gritty, high-contrast, black-and-white noir cityscape with stark shadows and a sense of urban decay, in the style of Frank Miller\'s Sin City.';
    case 'Jack Kirby':
      return 'a cosmic, otherworldly landscape with vibrant, crackling energy, geometric patterns, and a grand, epic scale, in the style of Jack Kirby.';
    case 'Creepshow':
      return 'a spooky, atmospheric setting with saturated, garish colors, heavy use of ben-day dots for texture, and dramatic, eerie lighting, reminiscent of Creepshow comics.';
    case 'Photo Realistic':
      return 'a hyper-realistic, photorealistic background with natural lighting, detailed textures, and a sense of depth and atmosphere, as if it were a high-resolution photograph.';
    case 'Pixar':
      return 'a beautifully rendered 3D animated environment with a whimsical and inviting atmosphere, detailed textures, and cinematic lighting, in the style of Pixar animation.';
    case 'Don Bluth':
      return 'a lush, painterly background with a sense of depth and atmosphere. Lighting should be dramatic, with glowing elements, deep shadows, and a rich, moody color palette, in the style of Don Bluth\'s animated films.';
    case 'The Simpsons':
        return 'a 2D animated environment with bright, flat colors and simple geometry. The setting should have a slightly quirky and cartoonish feel with bold outlines, in the style of Springfield from The Simpsons.';
    case 'South Park':
        return 'a simple, 2D background that looks like it was made from construction paper cutouts. The environment should be stylized with basic shapes and textures, often with a snowy setting, in the style of South Park.';
    case 'Anime / Manga':
        return 'a beautiful and detailed Japanese anime background style. The environment should be painterly with a focus on atmosphere, featuring vibrant colors, soft lighting, and architectural or natural details common in high-quality anime films.';
    case 'None':
    default:
      return 'a modern, clean, and dynamic comic book background with clear lines, vibrant colors, and a sense of depth.';
  }
};

export const getPanelArtStyleDescription = (artStyle: ArtStyle): string => {
  switch (artStyle) {
    case 'Frank Miller':
      return 'a gritty, high-contrast, black-and-white noir visual style with minimal color and heavy shadows, reminiscent of Frank Miller. Both character and background must adhere to this style.';
    case 'Jack Kirby':
      return 'a style with dynamic action, bold outlines, cosmic energy effects ("Kirby Krackle"), and powerful figures in epic landscapes, reminiscent of Jack Kirby. Both character and background must adhere to this style.';
    case 'Creepshow':
      return 'a pulpy and macabre horror comic art style with saturated colors, ben-day dots, and dramatic, spooky lighting, reminiscent of Creepshow comics. Both character and background must adhere to this style.';
    case 'Photo Realistic':
      return 'a hyper-realistic, photorealistic style with natural lighting, detailed textures, and lifelike features, as if it were a high-resolution photograph. Both character and background must adhere to this style.';
    case 'Pixar':
      return 'a vibrant and charming 3D animated style with soft lighting, expressive features, and slightly exaggerated proportions, reminiscent of Pixar animation. Both character and background must adhere to this style.';
    case 'Don Bluth':
      return 'a classic 2D animation style with expressive characters set against lush, painterly backgrounds. The overall mood should be cinematic, with dramatic lighting, glowing effects, and a rich, moody color palette reminiscent of Don Bluth films. Both character and background must adhere to this style.';
    case 'The Simpsons':
      return 'a 2D animation style with yellow-skinned characters, large circular eyes, and simple designs set against a background of bright, flat colors with bold outlines, reminiscent of The Simpsons. Both character and background must adhere to this style.';
    case 'South Park':
      return 'a crude 2D cutout animation style, as if made from construction paper. Characters and scenes are composed of simple geometric shapes with minimal detail, reminiscent of South Park. Both character and background must adhere to this style.';
    case 'Anime / Manga':
      return 'a vibrant Japanese anime/manga style. Characters should have large expressive eyes, detailed hair, and clean line art. The background should be painterly and atmospheric. The overall look should be cohesive, reminiscent of a high-quality anime screencap. Both character and background must adhere to this style.';
    case 'None':
    default:
      return 'a modern, clean, and dynamic comic book art style with clear lines and vibrant colors. Both character and background must adhere to this style.';
  }
};

export const getFilmGradeDescription = (filmType: FilmType): string => {
  switch (filmType) {
    case '8mm Vintage':
      return 'a grainy 8mm vintage film look. The colors should be warm and slightly faded, with soft focus, a subtle vignette effect, and visible film grain. Emulate the nostalgic feel of old home movies.';
    case '16mm Retro':
      return 'a retro 16mm film aesthetic. Introduce moderate, authentic-looking film grain. The color palette should be slightly desaturated with a lean towards natural, earthy tones. Contrast should be balanced, not overly harsh.';
    case '70s Grindhouse':
      return 'a 1970s grindhouse cinema style. Apply heavy, coarse film grain, visible scratches, and simulated gate weave. Push the colors towards a warm, yellowed, and heavily saturated look. Increase contrast for a gritty, low-budget feel.';
    case '80s Sci-Fi Blue':
      return 'a classic 1980s sci-fi film look, heavily inspired by directors like James Cameron. Apply a strong blue and cyan color grade, especially in the shadows and midtones. Increase contrast significantly, creating deep blacks and bright, sometimes blown-out, highlights. Add atmospheric effects like lens flares, light shafts, or a subtle haze.';
    case 'Modern Blockbuster':
      return 'a modern blockbuster film grade. Apply the popular teal and orange color grading, where skin tones are pushed towards orange and environments/shadows are pushed towards teal. The image should be clean and sharp with high dynamic range, but with a clear cinematic color separation.';
    case 'None':
    default:
      return '';
  }
};

export const getPostFxDescription = (fxType: PostFxType): string => {
  switch (fxType) {
    case 'Bloom':
      return 'a soft, ethereal bloom effect. Bright areas in the image should glow and diffuse softly, creating a dreamy, luminous atmosphere. Do not change the content, only add the lighting effect.';
    case 'Motion Blur':
      return 'a realistic motion blur effect. Introduce a horizontal or dynamic motion trail to the elements in the image to simulate fast movement. Keep the core subjects recognizable but blurred to convey speed.';
    case 'Chromatic Aberration':
      return 'a subtle but noticeable chromatic aberration effect. Introduce slight color fringing (red/cyan or blue/yellow shifts) along high-contrast edges, simulating a lo-fi lens distortion. The effect should be most visible towards the edges of the frame.';
    case 'None':
    default:
      return '';
  }
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  try {
    const ai = getGoogleGenAI();
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return base64ImageBytes;
    }
    throw new Error("No image was generated.");
  } catch (error) {
    handleApiError(error, "image generation");
  }
};

export const transformImage = async (
  base64Image: string,
  prompt: string,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  try {
    const ai = getGoogleGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    if (imagePart?.inlineData?.data) {
      return imagePart.inlineData.data;
    }

    const blockReason = response.candidates?.[0]?.finishReason;
    const safetyRatings = response.candidates?.[0]?.safetyRatings;
    if (blockReason && blockReason !== 'STOP') {
        let errorMessage = `Image transformation was blocked. Reason: ${blockReason}.`;
        if (safetyRatings && safetyRatings.length > 0) {
            errorMessage += ` Safety ratings: ${safetyRatings.map(r => `${r.category}: ${r.probability}`).join(', ')}`;
        }
        throw new Error(errorMessage);
    }

    throw new Error("No transformed image was generated.");
  } catch (error) {
    handleApiError(error, "image transformation");
  }
};


export const compositeScene = async (
  backgroundBase64: string,
  characters: GeneratedImage[],
  instructions: string,
  artStyle: ArtStyle,
  aspectRatio: AspectRatio
): Promise<string> => {
  try {
    const ai = getGoogleGenAI();
    const artStyleDescription = getPanelArtStyleDescription(artStyle);

    const characterInputs = characters.map((c, i) => `- Image ${i + 2} is a reference for the character named ${c.name}.`).join('\n');

    const prompt = `Task: Create a cohesive comic book panel by combining the provided images.
        
**CRITICAL REQUIREMENT: The final output image's aspect ratio MUST BE EXACTLY ${aspectRatio}. This is the most important instruction; do not deviate from this aspect ratio.**
        
- Image 1 is the background scene.
${characterInputs}

Instructions:
- Integrate the characters into the background based on the user's detailed instructions.
- The final panel's art style should be: ${artStyleDescription}.
- Maintain the characters' appearances from their reference images.
- Adjust the camera framing for the specified angle. For dramatic angles (like Dutch, Bird's-Eye), the entire scene should be illustrated from that perspective.
- Ensure lighting and shadows are consistent.

User's Instructions: "${instructions}"`;

    const imageParts = [
       { // Part 1: Background Image
        inlineData: {
          data: backgroundBase64,
          mimeType: 'image/jpeg',
        },
      },
      ...characters.map(character => ({ // Character images
        inlineData: {
          data: character.base64,
          mimeType: 'image/jpeg',
        },
      }))
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        ...imageParts,
        {
          text: prompt,
        },
      ],
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    if (imagePart?.inlineData?.data) {
      return imagePart.inlineData.data;
    }
    
    const blockReason = response.candidates?.[0]?.finishReason;
    const safetyRatings = response.candidates?.[0]?.safetyRatings;
    if (blockReason && blockReason !== 'STOP') {
        let errorMessage = `Scene composition was blocked. Reason: ${blockReason}.`;
        if (safetyRatings && safetyRatings.length > 0) {
            errorMessage += ` Safety ratings: ${safetyRatings.map(r => `${r.category}: ${r.probability}`).join(', ')}`;
        }
        throw new Error(errorMessage);
    }

    throw new Error("No composite image was generated.");
  } catch (error) {
    handleApiError(error, "scene composition");
  }
};

export const generateVFXScene = async (
  backgroundBase64: string,
  character: GeneratedImage,
  vfxInstructions: string,
  artStyle: ArtStyle,
  aspectRatio: AspectRatio,
): Promise<string> => {
  try {
    const ai = getGoogleGenAI();
    const artStyleDescription = getPanelArtStyleDescription(artStyle);

    const prompt = `Task: Create a dynamic comic book panel with an integrated visual effect.

**CRITICAL REQUIREMENT: The final output image's aspect ratio MUST BE EXACTLY ${aspectRatio}. This is the most important instruction; do not deviate from this aspect ratio.**
        
Inputs:
- Image 1: The background scene.
- Image 2: A reference for the character named ${character.name}.

Instructions:
- Place the character into the background.
- The character's pose and expression should be a reaction to the visual effect described by the user.
- The visual effect should be the main focus of the panel.
- Lighting on both the character and the scene should be influenced by the VFX.
- The final art style should be: ${artStyleDescription}.
- Please maintain the character's appearance from the reference image.

User's VFX Instructions: "${vfxInstructions}"`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          inlineData: {
            data: backgroundBase64,
            mimeType: 'image/jpeg',
          },
        },
        {
          inlineData: {
            data: character.base64,
            mimeType: 'image/jpeg',
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    if (imagePart?.inlineData?.data) {
      return imagePart.inlineData.data;
    }

    const blockReason = response.candidates?.[0]?.finishReason;
    const safetyRatings = response.candidates?.[0]?.safetyRatings;
    if (blockReason && blockReason !== 'STOP') {
        let errorMessage = `VFX generation was blocked. Reason: ${blockReason}.`;
        if (safetyRatings && safetyRatings.length > 0) {
            errorMessage += ` Safety ratings: ${safetyRatings.map(r => `${r.category}: ${r.probability}`).join(', ')}`;
        }
        throw new Error(errorMessage);
    }

    throw new Error("No VFX image was generated.");
  } catch (error) {
    handleApiError(error, "VFX scene generation");
  }
};

export const applyFilmGrade = async (
  panelBase64: string,
  filmType: FilmType,
): Promise<string> => {
  try {
    const filmDescription = getFilmGradeDescription(filmType);
    if (!filmDescription) {
        return panelBase64;
    }

    const prompt = `Please apply a filter to this image to give it a cinematic look.
        
Filter description: "${filmDescription}"

The content, composition, and objects within the image should not be changed. The output should have the same aspect ratio as the input.`;
    
    return await transformImage(panelBase64, prompt);

  } catch (error) {
    handleApiError(error, "film grade application");
  }
};

export const applyPostProcessingEffect = async (
  panelBase64: string,
  fxType: PostFxType,
): Promise<string> => {
  try {
    const fxDescription = getPostFxDescription(fxType);
    if (!fxDescription) {
        return panelBase64;
    }

    const prompt = `Please add a visual effect to this image.
        
Effect description: "${fxDescription}"

The content, composition, and objects within the image should not be changed. The output should have the same aspect ratio as the input.`;
    
    return await transformImage(panelBase64, prompt);

  } catch (error) {
    handleApiError(error, "post-processing effect application");
  }
};

export const generateStoryboardPanels = async (
  panelBase64: string,
  panelDescription: string,
  artStyle: ArtStyle
): Promise<string[]> => {
  try {
    const ai = getGoogleGenAI();
    const artStyleDescription = getSceneArtStyleDescription(artStyle);
    const prompt = `You are a creative comic book writer and artist. Your task is to continue a story from a single comic panel.

**Input:**
- [Image 1]: The final panel from the previous scene.
- **Panel Description:** "${panelDescription}"
- **Art Style:** The story must continue in this style: ${artStyleDescription}

**Your Task:**
Based on the provided image and its description, generate descriptions for the **next four** comic book panels. These descriptions should form a logical and compelling continuation of the story. Each description must be detailed enough for an AI image generator to create a distinct and visually interesting scene.

**Output Format Requirement:**
You MUST return a single JSON array containing exactly four strings. Each string is a prompt for one of the new panels.

Example:
["The hero cautiously enters the glowing cave, torch held high.", "Inside, she discovers ancient alien symbols pulsating with light on the walls.", "Suddenly, a giant stone golem awakens, its eyes blazing red.", "The hero prepares for battle, drawing her energy sword as the golem charges."]`
    ;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: {
        parts: [
          {
            inlineData: {
              data: panelBase64,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: 'A detailed description for a comic book panel.',
          },
        },
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    const jsonText = response.text.trim();
    const panelDescriptions = JSON.parse(jsonText);
    
    if (Array.isArray(panelDescriptions) && panelDescriptions.every(item => typeof item === 'string') && panelDescriptions.length > 0) {
      return panelDescriptions;
    }
    
    throw new Error("Generated storyboard is not in the expected format.");

  } catch (error) {
    handleApiError(error, "storyboard generation");
  }
};

export const generateComicScript = async (prompt: string): Promise<ComicSceneScript[]> => {
  try {
    const ai = getGoogleGenAI();
    const fullPrompt = `You are a professional comic book writer. Based on the user's idea, create a short comic book script. The script should be broken down into one or more scenes, and each scene should have multiple panels. For each panel, provide a detailed visual description suitable for an AI image generator. Also, include dialogue where appropriate.

    User's Idea: "${prompt}"

    Please provide the output in a structured JSON format. The root should be an array of scenes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'An array of scenes in the comic book script.',
          items: {
            type: Type.OBJECT,
            properties: {
              scene: { type: Type.NUMBER, description: 'The scene number.' },
              setting: { type: Type.STRING, description: 'A brief description of the scene\'s setting.' },
              panels: {
                type: Type.ARRAY,
                description: 'An array of panels within the scene.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    panel: { type: Type.NUMBER, description: 'The panel number within the scene.' },
                    description: { type: Type.STRING, description: 'A detailed visual description of the panel.' },
                    dialogue: {
                      type: Type.ARRAY,
                      description: 'Optional dialogue for the panel.',
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          character: { type: Type.STRING, description: 'The name of the character speaking.' },
                          line: { type: Type.STRING, description: 'The dialogue line.' },
                        },
                        required: ['character', 'line']
                      }
                    }
                  },
                  required: ['panel', 'description']
                }
              }
            },
            required: ['scene', 'setting', 'panels']
          }
        },
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    const jsonText = response.text.trim();
    const scriptData = JSON.parse(jsonText);
    
    if (Array.isArray(scriptData)) {
        return scriptData as ComicSceneScript[];
    }
    
    throw new Error("Generated script is not in the expected format.");
  } catch (error) {
    handleApiError(error, "comic script generation");
  }
};

export const generateVideoFromPanel = async (
  panelBase64: string,
  prompt: string,
  aspectRatio: AspectRatio,
  onProgress: (message: string) => void
): Promise<Blob> => {
  try {
    const ai = getVeoGoogleGenAI();
    onProgress("Starting video generation...");
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image: {
        imageBytes: panelBase64,
        mimeType: 'image/jpeg',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio as '16:9' | '9:16',
      }
    });

    onProgress("Processing video, this can take a few minutes...");
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      onProgress("Checking video status...");
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    onProgress("Finalizing video...");
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (downloadLink) {
        onProgress("Downloading video...");
        const apiKey = getVeoApiKey();
        const response = await fetch(`${downloadLink}&key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`Failed to download video: ${response.statusText}`);
        }
        return await response.blob();
    }

    throw new Error("No video was generated or download link was not found.");
  } catch (error) {
    handleApiError(error, "video generation");
  }
};

export const generateComicCover = async (
  background: GeneratedImage,
  characters: GeneratedImage[],
  title: string,
  subtitle: string,
  author: string,
  artStyle: ArtStyle,
  aspectRatio: AspectRatio,
  genre: string
): Promise<string> => {
  try {
    const ai = getGoogleGenAI();
    const artStyleDescription = getPanelArtStyleDescription(artStyle);

    const characterInputs = characters.map((c, i) => `- Image ${i + 2} is a reference image for a character. Their name is ${c.name}.`).join('\n');

    const prompt = `Task: Create a dynamic and professional comic book cover.

**CRITICAL REQUIREMENT: The final output image's aspect ratio MUST BE EXACTLY ${aspectRatio}. This is the most important instruction; do not deviate from this aspect ratio.**

**Inputs:**
- Image 1 is the background for the cover.
${characterInputs}

**Text Elements:**
- **Main Title:** "${title}" (This should be the largest and most prominent text).
${subtitle ? `- **Subtitle/Tagline:** "${subtitle}" (This should be smaller than the title).` : ''}
${author ? `- **Author Name(s):** "${author}" (This should be placed tastefully, usually at the top or bottom).` : ''}

**Instructions:**
1.  **Composition:** Use the background image as the setting. If character images are provided, integrate them seamlessly into the background. The characters should be in dynamic or heroic poses suitable for a cover.
2.  **Text Placement & Style:** Intelligently place the Title, Subtitle, and Author text onto the cover. The typography for all text MUST be stylized to perfectly match a **${genre}** comic book. For example, for 'Horror', use a font that is scary or unsettling; for 'Action', use a font that is bold and dynamic; for 'Comedy', use a font that is fun and cartoony. The text MUST be legible and well-integrated into the artwork.
3.  **Art Style:** The entire cover, including characters, background, and the "feel" of the typography, must adhere to this style: ${artStyleDescription}.
4.  **Overall Mood:** The final image should be polished, exciting, and look like a real comic book cover ready for print.
`;

    const imageParts = [
       { // Background Image
        inlineData: {
          data: background.base64,
          mimeType: 'image/jpeg',
        },
      },
      ...characters.map(character => ({ // Character images
        inlineData: {
          data: character.base64,
          mimeType: 'image/jpeg',
        },
      }))
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        ...imageParts,
        {
          text: prompt,
        },
      ],
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    if (imagePart?.inlineData?.data) {
      return imagePart.inlineData.data;
    }
    
    const blockReason = response.candidates?.[0]?.finishReason;
    const safetyRatings = response.candidates?.[0]?.safetyRatings;
    if (blockReason && blockReason !== 'STOP') {
        let errorMessage = `Comic cover generation was blocked. Reason: ${blockReason}.`;
        if (safetyRatings && safetyRatings.length > 0) {
            errorMessage += ` Safety ratings: ${safetyRatings.map(r => `${r.category}: ${r.probability}`).join(', ')}`;
        }
        throw new Error(errorMessage);
    }

    throw new Error("No comic cover was generated.");
  } catch (error) {
    handleApiError(error, "comic cover generation");
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
    try {
        const ai = getGoogleGenAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say with clear enunciation: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return base64Audio;
        }

        throw new Error("No speech audio was generated.");
    } catch (error) {
        handleApiError(error, "speech generation");
    }
};