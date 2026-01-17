import { useEffect } from "react";
import { useAudioPlayer } from "expo-audio";

import { useAppData } from "@/hooks/use-app-data";

const soundSource = require("@/assets/audio/abang-colek-jingle.mp3");

export function useSoundEffects() {
  const { data } = useAppData();
  const player = useAudioPlayer(soundSource);

  useEffect(() => {
    return () => {
      player.pause();
      player.release();
    };
  }, [player]);

  const playClick = () => {
    if (!data.settings.soundEffects) return;
    player.seekTo(0);
    player.play();
  };

  return { playClick };
}
