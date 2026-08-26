/**
 * Ritual completion sounds. One is free/default; the rest are premium
 * unlocks (see paywall.tsx FEATURES, which templates PREMIUM_RITUAL_SOUNDS
 * .length so the two never drift). All files are royalty-free Pixabay sound
 * effects (Pixabay Content License — free for commercial use, no
 * attribution required): https://pixabay.com/service/license-summary/
 */
export type RitualSoundId =
  | "correct-answer"
  | "door-bell"
  | "level-up"
  | "lofi-bell"
  | "game-glitch"
  | "error-dings"
  | "cannon-whoosh"
  | "dramatic-stab"
  | "eerie-stab";

export type RitualSound = {
  id: RitualSoundId;
  label: string;
  file: number;
  free: boolean;
};

export const DEFAULT_RITUAL_SOUND_ID: RitualSoundId = "correct-answer";

export const RITUAL_SOUNDS: RitualSound[] = [
  {
    id: "correct-answer",
    label: "confirm_ping",
    file: require("../../assets/audio/correct-answer.mp3"),
    free: true,
  },
  {
    id: "level-up",
    label: "level_up",
    file: require("../../assets/audio/level-up.mp3"),
    free: false,
  },
  {
    id: "door-bell",
    label: "door_chime",
    file: require("../../assets/audio/door-bell.mp3"),
    free: false,
  },
  {
    id: "lofi-bell",
    label: "lofi_bell",
    file: require("../../assets/audio/lofi-bell.mp3"),
    free: false,
  },
  {
    id: "game-glitch",
    label: "glitch_pulse",
    file: require("../../assets/audio/game-glitch.mp3"),
    free: false,
  },
  {
    id: "error-dings",
    label: "static_burst",
    file: require("../../assets/audio/error-dings.mp3"),
    free: false,
  },
  {
    id: "cannon-whoosh",
    label: "cannon_whoosh",
    file: require("../../assets/audio/cannon-whoosh.mp3"),
    free: false,
  },
  {
    id: "dramatic-stab",
    label: "hype_stab",
    file: require("../../assets/audio/dramatic-stab.mp3"),
    free: false,
  },
  {
    id: "eerie-stab",
    label: "eerie_stab",
    file: require("../../assets/audio/eerie-stab.mp3"),
    free: false,
  },
];

export const PREMIUM_RITUAL_SOUNDS = RITUAL_SOUNDS.filter((s) => !s.free);

export function getRitualSound(id: RitualSoundId): RitualSound {
  return RITUAL_SOUNDS.find((s) => s.id === id) ?? RITUAL_SOUNDS[0];
}
