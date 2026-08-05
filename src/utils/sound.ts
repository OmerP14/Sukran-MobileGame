import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { useSettingsStore } from "../store/settings-store";

const SOUND_FILES = {
  cardDeal: require("../../assets/sounds/card-deal.mp3"),
  requestSubmit: require("../../assets/sounds/request-submit.mp3"),
  requestSuccess: require("../../assets/sounds/request-success.mp3"),
  requestFail: require("../../assets/sounds/request-fail.mp3"),
  sukranAppear: require("../../assets/sounds/sukran-appear.mp3"),
  sukranConfirm: require("../../assets/sounds/sukran-confirm.mp3"),
  sukranTimeout: require("../../assets/sounds/sukran-timeout.mp3"),
  gameWin: require("../../assets/sounds/game-win.mp3"),
  gameLose: require("../../assets/sounds/game-lose.mp3"),
  uiTap: require("../../assets/sounds/ui-tap.mp3"),
} as const;

export type SoundName = keyof typeof SOUND_FILES;

// How many overlapping instances of a sound might realistically be in flight
// at once — everything here is a one-shot effect fired at most a couple of
// times close together, so a small fixed pool covers every sound.
const DEFAULT_POOL_SIZE = 2;

const pools = new Map<SoundName, AudioPlayer[]>();
const nextIndex = new Map<SoundName, number>();

function getPool(name: SoundName): AudioPlayer[] {
  let pool = pools.get(name);
  if (!pool) {
    pool = Array.from({ length: DEFAULT_POOL_SIZE }, () => createAudioPlayer(SOUND_FILES[name]));
    pools.set(name, pool);
  }
  return pool;
}

// A freshly created AudioPlayer hasn't finished loading its source yet, so
// playing it right away can silently do nothing. Rarely-used sounds (a
// request result, a Şükran timeout) would otherwise lose that race on their
// very first play of the session — call this once at startup, well before
// any of them are actually needed, so every pool is already loaded by then.
export function preloadSounds() {
  (Object.keys(SOUND_FILES) as SoundName[]).forEach((name) => getPool(name));
}

// Fire-and-forget playback, round-robin across a small pool per sound so two
// overlapping triggers (e.g. two cards landing close together) don't cut
// each other off. Respects the player's soundEnabled setting.
export function playSound(name: SoundName) {
  if (!useSettingsStore.getState().settings.soundEnabled) {
    return;
  }
  const pool = getPool(name);
  const index = (nextIndex.get(name) ?? 0) % pool.length;
  nextIndex.set(name, index + 1);
  const player = pool[index];
  player.pause();
  player.seekTo(0).finally(() => player.play());
}
