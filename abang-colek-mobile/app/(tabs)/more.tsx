import { ScrollView, Text, View, TouchableOpacity, Platform, Switch } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { JinglePlayer } from "@/components/jingle-player";
import { taglines } from "@/lib/preset-data";
import { useThemeContext } from "@/lib/theme-provider";
import { useColors } from "@/hooks/use-colors";
import { useAppData } from "@/hooks/use-app-data";
import { AchievementBadgeCard } from "@/components/ui/achievement-badge";

export default function MoreScreen() {
  const router = useRouter();
  const colors = useColors();
  const { colorScheme, setColorScheme } = useThemeContext();
  const { data, update } = useAppData();
  const handlePress = () => {
    if (Platform.OS !== "web" && data.settings.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView>
        <View className="gap-6">
          <Text className="text-3xl font-bold text-foreground">More</Text>

          {/* Jingle Player */}
          <JinglePlayer />

          {/* Brand Kit Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Brand Kit</Text>
            
            {/* Colors */}
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-3">Brand Colors</Text>
              <View className="flex-row gap-2">
                <View className="flex-1 items-center gap-1">
                  <View className="w-12 h-12 rounded-lg" style={{ backgroundColor: "#FFC107" }} />
                  <Text className="text-xs text-muted">Yellow</Text>
                </View>
                <View className="flex-1 items-center gap-1">
                  <View className="w-12 h-12 rounded-lg" style={{ backgroundColor: "#E53935" }} />
                  <Text className="text-xs text-muted">Red</Text>
                </View>
                <View className="flex-1 items-center gap-1">
                  <View className="w-12 h-12 rounded-lg" style={{ backgroundColor: "#1A1A1A" }} />
                  <Text className="text-xs text-muted">Black</Text>
                </View>
                <View className="flex-1 items-center gap-1">
                  <View className="w-12 h-12 rounded-lg" style={{ backgroundColor: "#4CAF50" }} />
                  <Text className="text-xs text-muted">Green</Text>
                </View>
              </View>
            </View>

            {/* Taglines */}
            <View className="bg-surface rounded-xl p-4 border border-border gap-3">
              <Text className="text-sm font-semibold text-foreground">Brand Taglines</Text>
              {taglines.map((tagline) => (
                <View key={tagline.id} className="gap-1">
                  <Text className="text-sm font-medium text-foreground">
                    {tagline.emoji} {tagline.text}
                  </Text>
                  <Text className="text-xs text-muted capitalize">
                    {tagline.context}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Appearance */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Appearance</Text>
            <View className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between">
              <View className="gap-1">
                <Text className="text-base font-semibold text-foreground">Dark Mode</Text>
                <Text className="text-xs text-muted">Toggle app theme</Text>
              </View>
              <Switch
                value={colorScheme === "dark"}
                onValueChange={(value) => {
                  handlePress();
                  setColorScheme(value ? "dark" : "light");
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colorScheme === "dark" ? colors.background : colors.surface}
              />
            </View>
          </View>

          {/* Preferences */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Preferences</Text>
            <View className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between">
              <View className="gap-1">
                <Text className="text-base font-semibold text-foreground">Sound Effects</Text>
                <Text className="text-xs text-muted">Play click sounds on actions</Text>
              </View>
              <Switch
                value={data.settings.soundEffects}
                onValueChange={(value) => {
                  handlePress();
                  void update((current) => ({
                    ...current,
                    settings: { ...current.settings, soundEffects: value },
                  }));
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={data.settings.soundEffects ? colors.background : colors.surface}
              />
            </View>
            <View className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between">
              <View className="gap-1">
                <Text className="text-base font-semibold text-foreground">Background Music</Text>
                <Text className="text-xs text-muted">Loop jingle during events</Text>
              </View>
              <Switch
                value={data.settings.backgroundMusic}
                onValueChange={(value) => {
                  handlePress();
                  void update((current) => ({
                    ...current,
                    settings: { ...current.settings, backgroundMusic: value },
                  }));
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={data.settings.backgroundMusic ? colors.background : colors.surface}
              />
            </View>
            <View className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between">
              <View className="gap-1">
                <Text className="text-base font-semibold text-foreground">Haptics</Text>
                <Text className="text-xs text-muted">Vibration on key actions</Text>
              </View>
              <Switch
                value={data.settings.haptics}
                onValueChange={(value) => {
                  void update((current) => ({
                    ...current,
                    settings: { ...current.settings, haptics: value },
                  }));
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={data.settings.haptics ? colors.background : colors.surface}
              />
            </View>
          </View>

          {/* Quick Links */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Quick Links</Text>
            
            <TouchableOpacity
              onPress={() => {
                handlePress();
                router.push("/events");
              }}
              className="bg-surface rounded-xl p-4 border border-border active:opacity-70"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">✅</Text>
                  <Text className="text-base font-semibold text-foreground">
                    Booth Ops Checklist
                  </Text>
                </View>
                <Text className="text-foreground">→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                handlePress();
                router.push("/reviews");
              }}
              className="bg-surface rounded-xl p-4 border border-border active:opacity-70"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">📊</Text>
                  <Text className="text-base font-semibold text-foreground">
                    Reviews & Analytics
                  </Text>
                </View>
                <Text className="text-foreground">→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                handlePress();
                router.push("/export");
              }}
              className="bg-surface rounded-xl p-4 border border-border active:opacity-70"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">📤</Text>
                  <Text className="text-base font-semibold text-foreground">
                    Export & Backup
                  </Text>
                </View>
                <Text className="text-foreground">→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                handlePress();
                router.push("/wocs");
              }}
              className="bg-surface rounded-xl p-4 border border-border active:opacity-70"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">🛰️</Text>
                  <Text className="text-base font-semibold text-foreground">
                    WOCS Agent Panel
                  </Text>
                </View>
                <Text className="text-foreground">→</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Achievement Badges */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Achievement Badges</Text>
            <View className="gap-3">
              {data.badges.map((badge) => (
                <AchievementBadgeCard key={badge.id} badge={badge} />
              ))}
            </View>
          </View>

          {/* Success Stories */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Success Highlights</Text>
            {data.successStories.map((story) => (
              <View key={story.id} className="bg-surface rounded-xl p-4 border border-border gap-1">
                <Text className="text-base font-semibold text-foreground">{story.title}</Text>
                <Text className="text-sm text-muted">{story.highlight}</Text>
                {story.metric ? <Text className="text-xs text-success">{story.metric}</Text> : null}
              </View>
            ))}
          </View>

          {/* Founder's Story */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-2">
            <Text className="text-lg font-semibold text-foreground">Founder's Story</Text>
            <Text className="text-sm text-muted">
              Bermula dari dapur kecil, Abang Colek bina komuniti yang cinta pedas. Setiap event
              adalah peluang untuk bawa rasa padu ke lebih ramai orang. Fokus kami: kualiti, konsisten,
              dan pengalaman pelanggan.
            </Text>
          </View>

          {/* About */}
          <View className="bg-surface rounded-xl p-6 border border-border items-center">
            <Text className="text-2xl mb-2">🌶️🥭</Text>
            <Text className="text-lg font-bold text-foreground mb-1">
              Abang Colek
            </Text>
            <Text className="text-sm text-muted text-center">
              Brand OS v1.0.0
            </Text>
            <Text className="text-xs text-muted text-center mt-3">
              by Liurleleh House
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
