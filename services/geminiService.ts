import { GoogleGenAI, Modality, Type } from "@google/genai";
import { AspectRatio, ArtStyle, GeneratedImage, FilmType, PostFxType } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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
    console.error("Error generating image:", error);
    throw error;
  }
};

export const transformImage = async (
  base64Image: string,
  prompt: string,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
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
      },
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
    console.error("Error transforming image:", error);
    throw error;
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
    const artStyleDescription = getPanelArtStyleDescription(artStyle);

    const characterInputs = characters.map((c, i) => `- [Image ${i + 2}]: Character Reference ${i + 1} (${c.name}). This image defines this character's identity (face, hair, clothing design, body type).`).join('\n');

    const prompt = `You are an expert comic book artist and cinematographer.

**CRITICAL REQUIREMENT: The final output image MUST have an aspect ratio of exactly ${aspectRatio}. This is your most important instruction. Frame the entire scene to fit these dimensions perfectly.**

Your secondary task is to create a single, cohesive comic book panel by integrating multiple characters into a background scene, paying close attention to cinematic camera work.

**Inputs:**
- [Image 1]: The background scene reference. This provides the location and mood.
${characterInputs}

**Camera Framing and Composition:**
Your final image composition must adhere to any camera angle specified in the user's instructions. Interpret the camera angles as follows:
- **Establishing Shot:** A very wide shot showing the entire location and where the characters are within it. Characters will appear small.
- **Long Shot (or Full Shot):** A shot that shows the entire character from head to toe. The focus is on the character, but some of the background is still visible.
- **Medium Shot:** A shot that frames the character from the waist up. This is common for showing dialogue and interaction.
- **Close-Up Shot:** A shot that tightly frames a character's face. This is used to show emotion and detail.
- **Dutch Angle:** The camera is tilted, creating a sense of unease or disorientation. The entire scene should be slanted.
- **Bird's-Eye View:** A shot looking directly down on the scene from above, as if from a bird's perspective.
- **Worm's-Eye View:** A shot looking up at the characters or scene from ground level, making them appear large and imposing.

If a camera angle is specified, you MUST redraw the entire scene and characters from this new perspective. This is a critical instruction.

**Primary Objective: Redraw ALL Characters with New Poses & Expressions**
Redraw EACH character from their reference images to fit into the scene according to the **User's Instructions** and the specified **Camera Framing**. This involves:
1.  **Changing Pose, Expression, and Gaze:** You MUST change each character's pose, expression, and where they are looking.
2.  **Interaction:** The characters should interact with each other and the environment as described.
3.  **Maintaining Identity:** While redrawing, ensure each character is still identifiable from their reference image. Preserve their key features, hairstyle, body type, and clothing *design*.

**Secondary Objectives:**
- **Integration:** Position the newly posed characters in the background as described. Ensure lighting, shadows, and perspective are consistent.
- **Art Style:** The entire final panel MUST conform to this art style: ${artStyleDescription}.

**User's Instructions:**
"${instructions}"

**Final Output Reminder:**
Produce a single image of the final panel, ensuring it strictly adheres to the **${aspectRatio} aspect ratio requirement.**`;

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
      contents: {
        parts: [
          ...imageParts,
          { // Part 3: Text Instructions
            text: prompt,
          },
        ],
      },
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
    console.error("Error compositing scene:", error);
    throw error;
  }
};

export const generateVFXScene = async (
  panelBase64: string,
  vfxInstructions: string,
  artStyle: ArtStyle
): Promise<string> => {
  try {
    const artStyleDescription = getPanelArtStyleDescription(artStyle);

    const prompt = `You are a VFX and comic book artist. Your task is to add a major visual effect (VFX) to an existing comic book panel.

**Input:**
- [Image 1]: The existing comic book panel, which may already contain characters and a background.

**User's Instructions for VFX:**
"${vfxInstructions}"

**Your Task:**
1.  **Add the VFX:** Dramatically alter the input image [Image 1] by adding the visual effects described in the user's instructions (e.g., explosions, energy beams, magical auras).
2.  **Enhance Reactions:** If the instructions mention a character, ensure their pose, expression, and the lighting on them are enhanced to react realistically to the new VFX.
3.  **Maintain Style & Identity:** The modifications must be consistent with the existing art style of the panel. The overall style is: ${artStyleDescription}. Any characters present should remain identifiable.
4.  **Preserve Composition:** Do not change the camera angle or the fundamental composition of the scene. Only add the effects and enhance the existing elements in reaction to them. The output image must have the same aspect ratio as the input.

**Final Output:**
A single, cohesive image of the comic book panel with the VFX added.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
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
    console.error("Error generating VFX scene:", error);
    throw error;
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

    const prompt = `You are an expert film colorist and post-production artist. Your task is to apply a specific cinematic filter to an existing image.

**Input:**
- [Image 1]: The source comic book panel.

**User's Instructions for Film Grade:**
"Apply ${filmDescription}"

**Your Task:**
1.  **Apply the Look:** Re-render the entire image to match the specified film look. This includes adjusting color grading, contrast, saturation, and adding film grain or other atmospheric effects as described.
2.  **Preserve Content:** You MUST NOT change the content, composition, characters, or objects within the image. Your only job is to apply a post-production filter over the entire panel.
3.  **Maintain Aspect Ratio:** The output image must have the exact same aspect ratio as the input image.

**Final Output:**
A single image of the panel with the film grade applied.`;
    
    return await transformImage(panelBase64, prompt);

  } catch (error) {
    console.error("Error applying film grade:", error);
    throw error;
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

    const prompt = `You are an expert film colorist and post-production artist. Your task is to apply a specific visual effect to an existing image.

**Input:**
- [Image 1]: The source comic book panel.

**User's Instructions for Visual Effect:**
"Apply ${fxDescription}"

**Your Task:**
1.  **Apply the Effect:** Re-render the entire image to add the specified visual effect.
2.  **Preserve Content:** You MUST NOT change the content, composition, characters, or objects within the image. Your only job is to apply a post-production filter over the entire panel.
3.  **Maintain Aspect Ratio:** The output image must have the exact same aspect ratio as the input image.

**Final Output:**
A single image of the panel with the visual effect applied.`;
    
    return await transformImage(panelBase64, prompt);

  } catch (error) {
    console.error("Error applying post-processing effect:", error);
    throw error;
  }
};

export const generateStoryboardPanels = async (
  panelBase64: string,
  panelDescription: string,
  artStyle: ArtStyle
): Promise<string[]> => {
  try {
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
    console.error("Error generating storyboard panels:", error);
    throw error;
  }
};