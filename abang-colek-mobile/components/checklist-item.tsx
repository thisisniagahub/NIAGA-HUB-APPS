import { Text, TouchableOpacity, View } from "react-native";

import type { ChecklistItem } from "@/lib/types";

type ChecklistItemProps = {
  item: ChecklistItem;
  onToggle: (itemId: string) => void;
};

export function ChecklistItemRow({ item, onToggle }: ChecklistItemProps) {
  return (
    <TouchableOpacity
      onPress={() => onToggle(item.id)}
      className="flex-row items-center justify-between rounded-xl border border-border bg-surface px-3 py-2"
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`h-5 w-5 rounded-full border ${
            item.completed ? "bg-success border-success" : "border-border"
          }`}
        />
        <Text className="text-sm text-foreground">{item.text}</Text>
      </View>
      <Text className="text-xs text-muted">{item.completed ? "Done" : "Todo"}</Text>
    </TouchableOpacity>
  );
}
