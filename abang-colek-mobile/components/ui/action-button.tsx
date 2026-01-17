import { Text, TouchableOpacity, View } from "react-native";

type ActionButtonProps = {
  label: string;
  icon?: string;
  variant?: "primary" | "secondary" | "danger";
  onPress?: () => void;
};

export function ActionButton({ label, icon, variant = "primary", onPress }: ActionButtonProps) {
  const containerClass =
    variant === "primary"
      ? "bg-primary"
      : variant === "danger"
        ? "bg-error"
        : "bg-surface border border-border";
  const textClass = variant === "secondary" ? "text-foreground" : "text-white";

  return (
    <TouchableOpacity onPress={onPress} className={`rounded-xl p-4 active:opacity-80 ${containerClass}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {icon ? <Text className="text-2xl">{icon}</Text> : null}
          <Text className={`text-base font-semibold ${textClass}`}>{label}</Text>
        </View>
        <Text className={textClass}>→</Text>
      </View>
    </TouchableOpacity>
  );
}
