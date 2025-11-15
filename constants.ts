import { AspectRatio, ArtStyle, CameraAngle, BodyShape, FilmType, PostFxType } from './types';

export const ASPECT_RATIOS: AspectRatio[] = ['1:1', '16:9', '21:9', '9:16', '4:3', '3:4'];

export const IMAGEN_ASPECT_RATIOS: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];

export const ART_STYLES: { value: ArtStyle, label: string }[] = [
  { value: 'None', label: 'Default Style' },
  { value: 'Photo Realistic', label: 'Photo Realistic' },
  { value: 'Pixar', label: 'Pixar Animation' },
  { value: 'Creepshow', label: 'Creepshow' },
  { value: 'Frank Miller', label: 'Frank Miller' },
  { value: 'Jack Kirby', label: 'Jack Kirby' },
];

export const CAMERA_ANGLES: { value: CameraAngle, label: string }[] = [
  { value: 'none', label: 'Default Angle' },
  { value: 'establishing', label: 'Establishing Shot' },
  { value: 'long', label: 'Long Shot' },
  { value: 'medium', label: 'Medium Shot' },
  { value: 'close-up', label: 'Close-Up Shot' },
  { value: 'dutch', label: 'Dutch Angle' },
  { value: 'birds-eye', label: "Bird's-Eye View" },
  { value: 'worms-eye', label: "Worm's-Eye View" },
];

export interface CameraPreset {
  value: string;
  label: string;
  angle: CameraAngle;
  instructionTemplate: string;
}

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    value: 'custom',
    label: 'Custom Angle',
    angle: 'none',
    instructionTemplate: '',
  },
  {
    value: 'establishing',
    label: 'Preset: Establishing Shot',
    angle: 'establishing',
    instructionTemplate: 'A wide establishing shot of the scene, showing the full environment. The characters are visible but small, establishing their location.',
  },
  {
    value: 'long',
    label: 'Preset: Long Shot',
    angle: 'long',
    instructionTemplate: 'A long shot that shows the characters from head to toe. The focus is on their full bodies and their relationship to the immediate surroundings.',
  },
  {
    value: 'medium',
    label: 'Preset: Medium Shot (Dialogue)',
    angle: 'medium',
    instructionTemplate: 'A medium shot framing the characters from the waist up. This is good for showing dialogue, interactions, and body language.',
  },
  {
    value: 'close-up',
    label: 'Preset: Close-Up (Emotion)',
    angle: 'close-up',
    instructionTemplate: "A close-up shot tightly framing one character's face to emphasize their emotion or reaction.",
  },
  {
    value: 'over-the-shoulder',
    label: 'Preset: Over-the-Shoulder',
    angle: 'medium',
    instructionTemplate: 'An over-the-shoulder shot, looking from behind one character towards another. This is commonly used in conversations to link two characters.',
  },
  {
    value: 'dutch',
    label: 'Preset: Dutch Angle (Tension)',
    angle: 'dutch',
    instructionTemplate: 'A Dutch angle shot where the camera is tilted, creating a sense of unease, tension, or disorientation in the scene.',
  },
  {
    value: 'birds-eye',
    label: "Preset: Bird's-Eye View (High Angle)",
    angle: 'birds-eye',
    instructionTemplate: "A bird's-eye view looking directly down on the scene from above. This can make characters seem vulnerable or show the scale of the environment.",
  },
  {
    value: 'worms-eye',
    label: "Preset: Worm's-Eye View (Low Angle)",
    angle: 'worms-eye',
    instructionTemplate: "A worm's-eye view looking up at the characters from ground level. This makes them appear powerful, heroic, or intimidating.",
  },
];


export const BODY_SHAPES_TEXT: { value: BodyShape, label: string }[] = [
  { value: 'Default', label: 'Default Body Shape' },
  { value: 'Average', label: 'Average' },
  { value: 'Athletic', label: 'Athletic' },
  { value: 'Slender', label: 'Slender' },
  { value: 'Muscular', label: 'Muscular' },
  { value: 'Heavy-set', label: 'Heavy-set' },
];

export const BODY_SHAPES_PHOTO: { value: BodyShape, label: string }[] = [
  { value: 'Default', label: 'As in Photo (Default)' },
  { value: 'Average', label: 'Average' },
  { value: 'Athletic', label: 'Athletic' },
  { value: 'Slender', label: 'Slender' },
  { value: 'Muscular', label: 'Muscular' },
  { value: 'Heavy-set', label: 'Heavy-set' },
];

export const COMIC_STICKERS: string[] = ['POW!', 'BAM!', 'CRASH!', 'BOOM!', 'ZAP!', 'WHAM!', 'SMASH!', 'KABOOM!'];

export const FILM_TYPES: { value: FilmType, label: string }[] = [
  { value: 'None', label: 'No Filter' },
  { value: '8mm Vintage', label: '8mm Vintage Film' },
  { value: '16mm Retro', label: '16mm Retro Film' },
  { value: '70s Grindhouse', label: '70s Grindhouse Look' },
  { value: '80s Sci-Fi Blue', label: '80s Sci-Fi (Cameron-esque)' },
  { value: 'Modern Blockbuster', label: 'Modern Blockbuster (Teal & Orange)' },
];

export const POST_FX_TYPES: { value: PostFxType, label: string }[] = [
  { value: 'None', label: 'No Effect' },
  { value: 'Bloom', label: 'Bloom (Ethereal Glow)' },
  { value: 'Motion Blur', label: 'Motion Blur (Speed)' },
  { value: 'Chromatic Aberration', label: 'Chromatic Aberration (Lens Distortion)' },
];