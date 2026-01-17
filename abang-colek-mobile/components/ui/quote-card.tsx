import { Text, TouchableOpacity, View } from "react-native";

type QuoteCardProps = {
  title?: string;
  quote: string;
  author?: string;
  onPress?: () => void;
  hint?: string;
};

export function QuoteCard({ title = "Daily Motivation", quote, author, onPress, hint }: QuoteCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-primary rounded-2xl p-6 shadow-sm active:opacity-80"
    >
      <View className="gap-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl">📈</Text>
          <Text className="text-sm font-semibold text-foreground uppercase tracking-wide">
            {title}
          </Text>
        </View>
        <Text className="text-lg font-bold text-foreground leading-relaxed">
          "{quote}"
        </Text>
        {author ? <Text className="text-sm text-foreground/70">— {author}</Text> : null}
        {hint ? (
          <Text className="text-xs text-foreground/50 text-center mt-2">{hint}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
