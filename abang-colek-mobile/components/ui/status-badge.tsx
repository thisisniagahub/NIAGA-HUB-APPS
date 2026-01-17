import { Text, View } from "react-native";

type StatusBadgeProps = {
  label: string;
  tone?: "primary" | "success" | "warning" | "error" | "muted";
};

const toneClass: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  muted: "bg-surface",
};

export function StatusBadge({ label, tone = "muted" }: StatusBadgeProps) {
  return (
    <View className={`px-3 py-1 rounded-full ${toneClass[tone]}`}>
      <Text className="text-xs font-semibold text-white">{label}</Text>
    </View>
  );
}
