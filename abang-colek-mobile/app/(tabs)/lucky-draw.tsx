import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Linking,
  RefreshControl,
} from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { useAppData } from "@/hooks/use-app-data";
import { useSoundEffects } from "@/hooks/use-sound-effects";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import type { LuckyDrawCampaign, LuckyDrawEntry } from "@/lib/types";

export default function LuckyDrawScreen() {
  const colors = useColors();
  const { data } = useAppData();
  const { playClick } = useSoundEffects();
  const [campaigns, setCampaigns] = useState<LuckyDrawCampaign[]>([]);
  const [entries, setEntries] = useState<LuckyDrawEntry[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load sample campaign
    const sampleCampaign: LuckyDrawCampaign = {
      id: "campaign-1",
      name: "Makan Fest 2026 Lucky Draw",
      description: "Join untuk menang 1 tahun supply Abang Colek FREE!",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      qrCodeUrl: "https://forms.gle/abangcolek-luckydraw",
      googleFormUrl: "https://forms.gle/abangcolek-luckydraw",
      requirements: {
        followTikTok: true,
        shareTikTok: true,
        tagFriends: 3,
      },
      prizeDescription: "1 Tahun Supply Abang Colek (12 botol x 12 bulan)",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    setCampaigns([sampleCampaign]);
    setSelectedCampaign(sampleCampaign.id);

    // Load sample entries
    const sampleEntries: LuckyDrawEntry[] = [
      {
        id: "entry-1",
        campaignId: "campaign-1",
        name: "Ahmad bin Ali",
        phone: "0123456789",
        email: "ahmad@example.com",
        tiktokUsername: "@ahmad_foodie",
        verified: true,
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "entry-2",
        campaignId: "campaign-1",
        name: "Siti Nurhaliza",
        phone: "0129876543",
        tiktokUsername: "@siti_makan",
        verified: true,
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "entry-3",
        campaignId: "campaign-1",
        name: "Farid Kamil",
        phone: "0187654321",
        tiktokUsername: "@farid_pedas",
        verified: false,
        verificationNotes: "Belum follow TikTok",
        submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
    ];

    setEntries(sampleEntries);
  }, []);

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaign);
  const campaignEntries = entries.filter((e) => e.campaignId === selectedCampaign);
  const verifiedEntries = campaignEntries.filter((e) => e.verified);

  const openGoogleForm = () => {
    if (Platform.OS !== "web" && data.settings.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (activeCampaign) {
      Linking.openURL(activeCampaign.googleFormUrl);
    }
  };

  const generateQRCode = () => {
    if (Platform.OS !== "web" && data.settings.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      "QR Code",
      "QR code generation will open in a new window. Use a QR generator service with the Google Form URL.",
      [
        {
          text: "Open QR Generator",
          onPress: () => {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
              activeCampaign?.googleFormUrl || ""
            )}`;
            Linking.openURL(qrUrl);
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const selectWinner = () => {
    if (Platform.OS !== "web" && data.settings.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    playClick();

    if (verifiedEntries.length === 0) {
      Alert.alert("No Entries", "Belum ada entries yang verified untuk lucky draw!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * verifiedEntries.length);
    const winner = verifiedEntries[randomIndex];

    Alert.alert(
      "🎉 WINNER SELECTED!",
      `Tahniah kepada:\n\n${winner.name}\n${winner.phone}\nTikTok: ${winner.tiktokUsername}\n\nSila hubungi winner untuk claim hadiah!`,
      [{ text: "OK" }]
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ms-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  if (!activeCampaign) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-6xl">🎁</Text>
          <Text className="text-xl font-bold text-foreground">
            No Active Campaign
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              Alert.alert("Coming Soon", "Campaign creation coming soon!");
            }}
            className="bg-primary px-6 py-3 rounded-full"
          >
            <Text className="text-base font-semibold text-foreground">
              Create Campaign
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />
        }
      >
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Lucky Draw 🎁
            </Text>
            <Text className="text-sm text-muted">
              Campaign management & winner selection
            </Text>
          </View>

          {/* Campaign Card */}
          <View className="bg-primary rounded-2xl p-5 gap-4">
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-foreground">
                  {activeCampaign.name}
                </Text>
                <View className="bg-success px-3 py-1 rounded-full">
                  <Text className="text-xs font-bold text-white uppercase">
                    {activeCampaign.status}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-foreground opacity-90">
                {activeCampaign.description}
              </Text>
            </View>

            <View className="gap-2">
              <Text className="text-xs font-semibold text-foreground opacity-70">
                PRIZE
              </Text>
              <Text className="text-base font-semibold text-foreground">
                🏆 {activeCampaign.prizeDescription}
              </Text>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-xs text-foreground opacity-70 mb-1">
                  Start Date
                </Text>
                <Text className="text-sm font-semibold text-foreground">
                  {formatDate(activeCampaign.startDate)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-foreground opacity-70 mb-1">
                  End Date
                </Text>
                <Text className="text-sm font-semibold text-foreground">
                  {formatDate(activeCampaign.endDate)}
                </Text>
              </View>
            </View>
          </View>

          {/* Requirements */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <Text className="text-base font-bold text-foreground">
              Entry Requirements:
            </Text>
            <View className="gap-2">
              {activeCampaign.requirements.followTikTok && (
                <View className="flex-row items-center gap-2">
                  <Text className="text-success">✓</Text>
                  <Text className="text-sm text-foreground">
                    Follow @styloairpool di TikTok
                  </Text>
                </View>
              )}
              {activeCampaign.requirements.shareTikTok && (
                <View className="flex-row items-center gap-2">
                  <Text className="text-success">✓</Text>
                  <Text className="text-sm text-foreground">
                    Share TikTok video ke story
                  </Text>
                </View>
              )}
              {activeCampaign.requirements.tagFriends > 0 && (
                <View className="flex-row items-center gap-2">
                  <Text className="text-success">✓</Text>
                  <Text className="text-sm text-foreground">
                    Tag {activeCampaign.requirements.tagFriends} kawan dalam
                    comment
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-3xl font-bold text-foreground">
                {campaignEntries.length}
              </Text>
              <Text className="text-xs text-muted mt-1">Total Entries</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-3xl font-bold text-success">
                {verifiedEntries.length}
              </Text>
              <Text className="text-xs text-muted mt-1">Verified</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-3xl font-bold text-warning">
                {campaignEntries.length - verifiedEntries.length}
              </Text>
              <Text className="text-xs text-muted mt-1">Pending</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={openGoogleForm}
              className="bg-error rounded-xl p-4 flex-row items-center justify-center gap-2"
            >
              <Text className="text-base font-bold text-white">
                📝 Open Google Form
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={generateQRCode}
              className="bg-foreground rounded-xl p-4 flex-row items-center justify-center gap-2"
            >
              <Text className="text-base font-bold text-background">
                📱 Generate QR Code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={selectWinner}
              disabled={verifiedEntries.length === 0}
              style={{
                opacity: verifiedEntries.length === 0 ? 0.5 : 1,
              }}
              className="bg-success rounded-xl p-4 flex-row items-center justify-center gap-2"
            >
              <Text className="text-base font-bold text-white">
                🎉 Select Winner
              </Text>
            </TouchableOpacity>
          </View>

          {/* Entries List */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">
              Recent Entries ({campaignEntries.length})
            </Text>

            {campaignEntries.length === 0 ? (
              <View className="bg-surface rounded-2xl p-8 items-center gap-2">
                <Text className="text-4xl">📋</Text>
                <Text className="text-base font-semibold text-foreground">
                  No entries yet
                </Text>
                <Text className="text-sm text-muted text-center">
                  Share the Google Form to start collecting entries
                </Text>
              </View>
            ) : (
              campaignEntries.map((entry) => (
                <View
                  key={entry.id}
                  className="bg-surface rounded-xl p-4 border border-border gap-2"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 gap-1">
                      <Text className="text-base font-semibold text-foreground">
                        {entry.name}
                      </Text>
                      <Text className="text-sm text-muted">{entry.phone}</Text>
                      {entry.tiktokUsername && (
                        <Text className="text-sm text-muted">
                          TikTok: {entry.tiktokUsername}
                        </Text>
                      )}
                    </View>
                    <View
                      className={`px-3 py-1 rounded-full ${
                        entry.verified ? "bg-success" : "bg-warning"
                      }`}
                    >
                      <Text className="text-xs font-bold text-white">
                        {entry.verified ? "✓ VERIFIED" : "⏳ PENDING"}
                      </Text>
                    </View>
                  </View>

                  {entry.verificationNotes && (
                    <View className="bg-background rounded-lg p-2 mt-1">
                      <Text className="text-xs text-muted">
                        Note: {entry.verificationNotes}
                      </Text>
                    </View>
                  )}

                  <Text className="text-xs text-muted mt-1">
                    Submitted {formatDateTime(entry.submittedAt)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
