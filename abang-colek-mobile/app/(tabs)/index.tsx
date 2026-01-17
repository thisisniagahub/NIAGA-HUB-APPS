import { ScrollView, Text, View, TouchableOpacity, Platform, Image } from "react-native";
import { useState, useEffect, useMemo } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useAppData } from "@/hooks/use-app-data";
import { motivationalQuotes } from "@/lib/preset-data";
import type { AppData } from "@/lib/types";
import { StatCard } from "@/components/ui/stat-card";
import { QuoteCard } from "@/components/ui/quote-card";
import { ActionButton } from "@/components/ui/action-button";
import { MilestoneCelebration } from "@/components/ui/milestone-celebration";
import { useRouter } from "expo-router";
import { createId } from "@/lib/utils";

export default function DashboardScreen() {
  const router = useRouter();
  const { data, update, loading } = useAppData();
  const [appData, setAppData] = useState<AppData | null>(null);
  const [dailyQuote, setDailyQuote] = useState(motivationalQuotes[0]);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  useEffect(() => {
    setRandomQuote();
  }, []);

  useEffect(() => {
    setAppData(data);
  }, [data]);

  const setRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setDailyQuote(motivationalQuotes[randomIndex]);
  };

  const handlePress = () => {
    if (Platform.OS !== "web" && data.settings.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const upcomingEvents = appData
    ? appData.events.filter((e) => e.status === "confirmed" || e.status === "lead").length
    : 0;
  const completedEvents = appData
    ? appData.events.filter((e) => e.status === "completed").length
    : 0;
  const totalHooks = appData ? appData.hooks.length : 0;
  const pendingContent = appData ? appData.contentPlans.filter((c) => !c.posted).length : 0;

  const achievementsToUnlock = useMemo(() => {
    if (!appData) return [];
    return appData.badges.filter((badge) => !badge.achieved);
  }, [appData]);

  useEffect(() => {
    if (!appData || celebrationMessage) return;
    const shouldCelebrate =
      completedEvents >= 1 || totalHooks >= 10 || pendingContent === 0;
    if (shouldCelebrate) {
      setCelebrationMessage("Milestone reached! Keep the momentum going.");
      update((current) => ({
        ...current,
        milestones: [
          {
            id: createId("milestone"),
            type: "custom",
            title: "Momentum up!",
            description: "Pipeline + content are moving.",
            achieved: true,
            achievedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          ...current.milestones,
        ],
      })).catch(() => undefined);
    }
  }, [appData, celebrationMessage, completedEvents, pendingContent, totalHooks, update]);

  useEffect(() => {
    if (!appData) return;
    const nextBadges = appData.badges.map((badge) => {
      if (badge.achieved) return badge;
      if (badge.id === "badge-1" && completedEvents >= 1) {
        return { ...badge, achieved: true, achievedAt: new Date().toISOString() };
      }
      if (badge.id === "badge-2" && appData.contentPlans.length >= 10) {
        return { ...badge, achieved: true, achievedAt: new Date().toISOString() };
      }
      if (badge.id === "badge-3" && appData.testimonials.length >= 5) {
        return { ...badge, achieved: true, achievedAt: new Date().toISOString() };
      }
      if (badge.id === "badge-4" && appData.milestones.some((m) => m.achieved)) {
        return { ...badge, achieved: true, achievedAt: new Date().toISOString() };
      }
      return badge;
    });
    const changed = nextBadges.some((badge, index) => badge.achieved !== appData.badges[index]?.achieved);
    if (changed) {
      update((current) => ({
        ...current,
        badges: nextBadges,
      })).catch(() => undefined);
    }
  }, [appData, completedEvents, update]);

  if (!appData || loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-muted">Loading...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="p-6 gap-6">
          {/* Header with Logo */}
          <View className="items-center gap-3 bg-primary rounded-2xl p-4">
            <Image
              source={require("@/assets/images/abang-colek-logo.png")}
              style={{ width: 240, height: 140 }}
              resizeMode="contain"
            />
            <Text className="text-sm font-medium text-foreground">
              Brand OS • Founder Dashboard
            </Text>
          </View>

          {/* Milestone Celebration */}
          {celebrationMessage ? (
            <MilestoneCelebration message={celebrationMessage} />
          ) : null}

          {/* Daily Motivation Card */}
          <QuoteCard
            quote={dailyQuote.quote}
            author={dailyQuote.author}
            hint="Tap untuk tukar quote"
            onPress={() => {
              handlePress();
              setRandomQuote();
            }}
          />

          {/* Quick Stats */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Quick Stats
            </Text>
            <View className="flex-row gap-3">
              <StatCard label="Upcoming Events" value={upcomingEvents} tone="primary" />
              <StatCard label="Completed" value={completedEvents} tone="success" />
            </View>
            <View className="flex-row gap-3">
              <StatCard label="TikTok Hooks" value={totalHooks} tone="error" />
              <StatCard label="Pending Posts" value={pendingContent} tone="warning" />
            </View>
          </View>

          {/* Quick Actions */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Quick Actions
            </Text>
            <ActionButton
              label="Add New Event"
              icon="📅"
              onPress={() => {
                handlePress();
                router.push("/events");
              }}
            />
            <ActionButton
              label="Create TikTok Content"
              icon="🎬"
              variant="danger"
              onPress={() => {
                handlePress();
                router.push("/(tabs)/tiktok");
              }}
            />
            <ActionButton
              label="Booth Checklist"
              icon="✅"
              variant="secondary"
              onPress={() => {
                handlePress();
                router.push("/events");
              }}
            />
          </View>

          {/* Brand Tagline */}
          <View className="bg-surface rounded-2xl p-6 border border-border items-center">
            <Text className="text-2xl font-bold text-foreground text-center mb-2">
              Rasa Padu, Pedas Menggamit
            </Text>
            <Text className="text-sm text-muted text-center">
              🌶️ PEDAS MANIS LIKAT MELEKAT 🥭
            </Text>
            <Text className="text-xs text-muted text-center mt-3 italic">
              "Rasa Sekali Jatuh Cinta Selamanya"
            </Text>
          </View>

          {/* Founder's Corner */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row items-center gap-2 mb-3">
              <Text className="text-2xl">💡</Text>
              <Text className="text-lg font-semibold text-foreground">
                Founder's Corner
              </Text>
            </View>
            <Text className="text-sm text-muted leading-relaxed">
              Setiap event adalah peluang untuk buat customer jatuh cinta dengan
              brand kita. Consistency, quality, dan passion - itulah formula
              kejayaan Abang Colek!
            </Text>
          </View>

          {/* Social Proof */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-3">
            <Text className="text-lg font-semibold text-foreground">Social Proof</Text>
            {appData.testimonials.slice(0, 2).map((item) => (
              <View key={item.id} className="bg-background rounded-xl p-4 border border-border">
                <Text className="text-sm text-foreground">"{item.quote}"</Text>
                <Text className="text-xs text-muted mt-2">— {item.customerName}</Text>
              </View>
            ))}
          </View>

          {/* Next Badge */}
          {achievementsToUnlock.length > 0 ? (
            <View className="bg-surface rounded-2xl p-6 border border-border gap-2">
              <Text className="text-lg font-semibold text-foreground">Next Badge</Text>
              <Text className="text-sm text-muted">
                {achievementsToUnlock[0]?.title}: {achievementsToUnlock[0]?.description}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
