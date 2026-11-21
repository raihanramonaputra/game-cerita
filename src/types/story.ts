export type StoryMood = "calm" | "tense" | "eerie";

export interface Choice {
  id: string;
  label: string;
  nextSceneId: string;
  clueObtained?: string;
}

export interface Scene {
  id: string;
  chapter: string;
  title: string;
  narration: string;
  mood: StoryMood;
  choices: Choice[];
  isEnding?: boolean;
  endingType?: "good" | "mystery";
}