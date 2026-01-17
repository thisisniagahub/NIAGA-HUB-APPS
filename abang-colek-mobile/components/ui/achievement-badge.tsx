import { Text, View } from "react-native";

import type { AchievementBadge } from "@/lib/types";

type AchievementBadgeProps = {
  badge: AchievementBadge;
};

export function AchievementBadgeCard({ badge }: AchievementBadgeProps) {
  return (
    <View className="bg-surface rounded-xl p-4 border border-border gap-2">
      <Text className="text-2xl">{badge.icon}</Text>
      <Text className="text-base font-semibold text-foreground">{badge.title}</Text>
      <Text className="text-xs text-muted">{badge.description}</Text>
      <View className={`self-start px-3 py-1 rounded-full ${badge.achieved ? "bg-success" : "bg-warning"}`}>
        <Text className="text-xs font-semibold text-white">
          {badge.achieved ? "Achieved" : "In Progress"}
        </Text>
      </View>
    </View>
  );
}
