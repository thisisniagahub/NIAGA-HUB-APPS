import { Text, View } from "react-native";

type StatCardProps = {
  label: string;
  value: string | number;
  tone?: "primary" | "success" | "warning" | "error" | "muted";
};

const toneClass: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
  muted: "text-muted",
};

export function StatCard({ label, value, tone = "primary" }: StatCardProps) {
  return (
    <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
      <Text className={`text-3xl font-bold ${toneClass[tone]}`}>{value}</Text>
      <Text className="text-sm text-muted mt-1">{label}</Text>
    </View>
  );
}
