import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useState, useEffect } from "react";
import { useAudioPlayer } from "expo-audio";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

const jingleSource = require("@/assets/audio/abang-colek-jingle.mp3");

export function JinglePlayer() {
  const colors = useColors();
  const router = useRouter();
  const player = useAudioPlayer(jingleSource);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Cleanup player on unmount
    return () => {
      player.pause();
      player.release();
    };
  }, []);

  const togglePlayback = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  return (
    <View className="bg-error rounded-2xl p-5 gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 gap-1">
          <Text className="text-lg font-bold text-white">
            🎵 Abang Colek Jingle
          </Text>
          <Text className="text-sm text-white opacity-80">
            Kasi Lagi-Lagi • Official Brand Anthem
          </Text>
        </View>
        <TouchableOpacity
          onPress={togglePlayback}
          className="bg-white rounded-full w-14 h-14 items-center justify-center"
        >
          <Text className="text-2xl">{isPlaying ? "⏸️" : "▶️"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          router.push("/jingle-lyrics" as any);
        }}
        className="bg-white bg-opacity-20 rounded-lg p-3"
      >
        <Text className="text-xs text-white opacity-90 leading-relaxed">
          "ABANG CHO-LEK! SAMBAL CHO-LEK! PEDAS! PADU!{"\n"}
          SEKALI RASA. YOU KNOW. PEDAS MANIS. STAYS."
        </Text>
        <Text className="text-xs text-white opacity-70 mt-2">
          Tap to view full lyrics →
        </Text>
      </TouchableOpacity>

      <View className="flex-row gap-2 flex-wrap">
        <View className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
          <Text className="text-xs text-white font-medium">Hip-Hop/Trap</Text>
        </View>
        <View className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
          <Text className="text-xs text-white font-medium">85-95 BPM</Text>
        </View>
        <View className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
          <Text className="text-xs text-white font-medium">Viral Anthem</Text>
        </View>
      </View>
    </View>
  );
}
