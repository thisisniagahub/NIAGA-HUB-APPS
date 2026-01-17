import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { jingleLyrics, jingleInfo } from "@/lib/jingle-lyrics";

export default function JingleLyricsScreen() {
  const router = useRouter();

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <TouchableOpacity onPress={() => router.back()} className="mb-2">
              <Text className="text-base text-primary">← Back</Text>
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">
              {jingleInfo.title}
            </Text>
            <Text className="text-base text-muted">
              {jingleInfo.artist} • {jingleInfo.genre}
            </Text>
          </View>

          {/* Info Card */}
          <View className="bg-error rounded-2xl p-5 gap-3">
            <Text className="text-lg font-bold text-white">Audio Identity</Text>
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-white opacity-70 text-sm">Style:</Text>
                <Text className="text-white text-sm font-medium">
                  {jingleInfo.style}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-white opacity-70 text-sm">Production:</Text>
                <Text className="text-white text-sm font-medium flex-1">
                  {jingleInfo.production}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-white opacity-70 text-sm">BPM:</Text>
                <Text className="text-white text-sm font-medium">
                  {jingleInfo.bpm}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-white opacity-70 text-sm">Purpose:</Text>
                <Text className="text-white text-sm font-medium flex-1">
                  {jingleInfo.purpose}
                </Text>
              </View>
            </View>
          </View>

          {/* Key Phrases */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <Text className="text-base font-bold text-foreground">
              Key Phrases
            </Text>
            {jingleInfo.keyPhrases.map((phrase, index) => (
              <View
                key={index}
                className="bg-background rounded-lg p-3 flex-row items-center gap-2"
              >
                <Text className="text-primary font-bold">•</Text>
                <Text className="text-sm text-foreground flex-1">{phrase}</Text>
              </View>
            ))}
          </View>

          {/* Full Lyrics */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <Text className="text-lg font-bold text-foreground">Full Lyrics</Text>
            <Text
              className="text-sm text-foreground leading-relaxed"
              style={{ fontFamily: "monospace" }}
            >
              {jingleLyrics}
            </Text>
          </View>

          {/* Usage Notes */}
          <View className="bg-primary rounded-2xl p-5 gap-3">
            <Text className="text-base font-bold text-foreground">
              🎯 Usage Guidelines
            </Text>
            <View className="gap-2">
              <Text className="text-sm text-foreground">
                • Use for event hype and booth atmosphere
              </Text>
              <Text className="text-sm text-foreground">
                • Perfect for TikTok content background
              </Text>
              <Text className="text-sm text-foreground">
                • Loopable for continuous play at events
              </Text>
              <Text className="text-sm text-foreground">
                • Signature "CHO-LEK!" chant for crowd engagement
              </Text>
              <Text className="text-sm text-foreground">
                • Code-switching (Malay/English) for wider appeal
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
