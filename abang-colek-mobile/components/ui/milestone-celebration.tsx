import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

type MilestoneCelebrationProps = {
  message: string;
};

export function MilestoneCelebration({ message }: MilestoneCelebrationProps) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <Animated.View
      style={{ opacity, transform: [{ scale }] }}
      className="bg-success rounded-2xl p-5 border border-border"
    >
      <View className="flex-row items-center gap-3">
        <Text className="text-2xl">🎉</Text>
        <Text className="text-base font-semibold text-white">{message}</Text>
      </View>
    </Animated.View>
  );
}
