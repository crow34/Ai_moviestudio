export interface GeneratedImage {
  id: string;
  prompt: string;
  base64: string;
  name?: string;
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9';

export type GenerationType = 'character' | 'scene';

export type ArtStyle = 'None' | 'Photo Realistic' | 'Creepshow' | 'Frank Miller' | 'Jack Kirby' | 'Pixar' | 'Don Bluth' | 'The Simpsons' | 'South Park' | 'Anime / Manga';

export type CameraAngle = 'none' | 'close-up' | 'medium' | 'long' | 'establishing' | 'dutch' | 'birds-eye' | 'worms-eye';

export type BodyShape = 'Default' | 'Average' | 'Athletic' | 'Slender' | 'Muscular' | 'Heavy-set';

export type FilmType = 'None' | '8mm Vintage' | '16mm Retro' | '70s Grindhouse' | '80s Sci-Fi Blue' | 'Modern Blockbuster';

export type PostFxType = 'None' | 'Bloom' | 'Motion Blur' | 'Chromatic Aberration';

export interface ComicPanelScript {
  panel: number;
  description: string;
  dialogue?: { character: string; line: string }[];
}

export interface ComicSceneScript {
  scene: number;
  setting: string;
  panels: ComicPanelScript[];
}