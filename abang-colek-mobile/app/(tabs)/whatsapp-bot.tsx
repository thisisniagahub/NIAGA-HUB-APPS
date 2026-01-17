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
import { useState } from "react";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAppData } from "@/hooks/use-app-data";
import { defaultWhatsAppConfig } from "@/lib/whatsapp-bot-types";
import { messageTemplates } from "@/lib/whatsapp-templates";
import { useRouter } from "expo-router";

export default function WhatsAppBotScreen() {
  const colors = useColors();
  const { data } = useAppData();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const categories = [
    { id: "customer_service", name: "Customer Service", icon: "💬", color: "#4CAF50" },
    { id: "event", name: "Event Registration", icon: "📅", color: "#2196F3" },
    { id: "lucky_draw", name: "Lucky Draw", icon: "🎁", color: "#FF9800" },
    { id: "order", name: "Order Management", icon: "🛒", color: "#9C27B0" },
    { id: "marketing", name: "Marketing Broadcast", icon: "📢", color: "#E53935" },
  ];

  const filteredTemplates = selectedCategory
    ? messageTemplates.filter((t) => t.category === selectedCategory)
    : messageTemplates;

  const copyTemplate = async (template: string) => {
    if (Platform.OS !== "web" && data.settings.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await Clipboard.setStringAsync(template);
    Alert.alert("✅ Copied!", "Template copied to clipboard");
  };

  const openWhatsApp = (number: string) => {
    if (Platform.OS !== "web" && data.settings.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const url = `https://wa.me/${number.replace(/^0/, "60")}`;
    Linking.openURL(url);
  };

  const sendBroadcast = () => {
    if (Platform.OS !== "web" && data.settings.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    Alert.alert(
      "Broadcast Message",
      "This will send message to all customers. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            Alert.alert("✅ Broadcast Sent!", "Message sent to all customers");
          },
        },
      ]
    );
  };

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
              WhatsApp Bot 💬
            </Text>
            <Text className="text-sm text-muted">
              Automated messaging & customer management
            </Text>
          </View>

          {/* Config Card */}
          <View className="bg-success rounded-2xl p-5 gap-4">
            <View className="flex-row items-center justify-between">
              <View className="gap-1">
                <Text className="text-lg font-bold text-white">
                  {defaultWhatsAppConfig.businessName}
                </Text>
                <Text className="text-sm text-white opacity-80">
                  Bot Status: Active ✅
                </Text>
              </View>
              <View className="bg-white bg-opacity-20 px-3 py-2 rounded-lg">
                <Text className="text-xs font-bold text-white">
                  AUTO-REPLY ON
                </Text>
              </View>
            </View>

            <View className="bg-white bg-opacity-20 rounded-lg p-3 gap-2">
              <Text className="text-xs font-semibold text-white opacity-90">
                ADMIN NUMBERS:
              </Text>
              {defaultWhatsAppConfig.adminNumbers.map((number, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => openWhatsApp(number)}
                  className="flex-row items-center justify-between"
                >
                  <Text className="text-sm font-medium text-white">
                    📱 {number}
                  </Text>
                  <Text className="text-xs text-white opacity-70">
                    Tap to open →
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-foreground">127</Text>
              <Text className="text-xs text-muted mt-1">Messages Today</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-success">94%</Text>
              <Text className="text-xs text-muted mt-1">Auto-Reply Rate</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-primary">23</Text>
              <Text className="text-xs text-muted mt-1">Pending</Text>
            </View>
          </View>

          {/* Categories */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">
              Message Categories
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== "web" && data.settings.haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedCategory(null);
                }}
                style={{
                  opacity: selectedCategory === null ? 1 : 0.7,
                }}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === null
                    ? "bg-foreground"
                    : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedCategory === null ? "text-background" : "text-foreground"
                  }`}
                >
                  All ({messageTemplates.length})
                </Text>
              </TouchableOpacity>

              {categories.map((cat) => {
                const count = messageTemplates.filter(
                  (t) => t.category === cat.id
                ).length;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      if (Platform.OS !== "web" && data.settings.haptics) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setSelectedCategory(cat.id);
                    }}
                    style={{
                      opacity: selectedCategory === cat.id ? 1 : 0.7,
                      backgroundColor:
                        selectedCategory === cat.id ? cat.color : undefined,
                    }}
                    className={`px-4 py-2 rounded-full ${
                      selectedCategory === cat.id
                        ? ""
                        : "bg-surface border border-border"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedCategory === cat.id
                          ? "text-white"
                          : "text-foreground"
                      }`}
                    >
                      {cat.icon} {cat.name} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Templates List */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">
              Message Templates ({filteredTemplates.length})
            </Text>

            {filteredTemplates.map((template) => (
              <View
                key={template.id}
                className="bg-surface rounded-2xl p-4 border border-border gap-3"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 gap-1">
                    <Text className="text-base font-semibold text-foreground">
                      {template.name}
                    </Text>
                    {template.trigger.length > 0 && (
                      <View className="flex-row flex-wrap gap-1 mt-1">
                        {template.trigger.slice(0, 3).map((trigger, idx) => (
                          <View
                            key={idx}
                            className="bg-background px-2 py-1 rounded"
                          >
                            <Text className="text-xs text-muted">
                              "{trigger}"
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                  {template.requiresAdmin && (
                    <View className="bg-warning px-2 py-1 rounded">
                      <Text className="text-xs font-bold text-white">
                        ADMIN
                      </Text>
                    </View>
                  )}
                </View>

                <View className="bg-background rounded-lg p-3">
                  <Text className="text-sm text-foreground leading-relaxed">
                    {template.message.length > 200
                      ? template.message.substring(0, 200) + "..."
                      : template.message}
                  </Text>
                </View>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => copyTemplate(template.message)}
                    className="flex-1 bg-primary rounded-lg py-2 items-center"
                  >
                    <Text className="text-sm font-semibold text-foreground">
                      📋 Copy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (Platform.OS !== "web" && data.settings.haptics) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      Alert.alert(
                        template.name,
                        template.message,
                        [{ text: "Close" }]
                      );
                    }}
                    className="flex-1 bg-foreground rounded-lg py-2 items-center"
                  >
                    <Text className="text-sm font-semibold text-background">
                      👁️ View Full
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">
              Quick Actions
            </Text>

            <TouchableOpacity
              onPress={sendBroadcast}
              className="bg-error rounded-xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-3xl">📢</Text>
                <View>
                  <Text className="text-base font-bold text-white">
                    Send Broadcast
                  </Text>
                  <Text className="text-sm text-white opacity-80">
                    Message all customers
                  </Text>
                </View>
              </View>
              <Text className="text-white text-xl">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                router.push("/whatsapp-analytics");
              }}
              className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-3xl">📊</Text>
                <View>
                  <Text className="text-base font-bold text-foreground">
                    View Analytics
                  </Text>
                  <Text className="text-sm text-muted">
                    Bot performance metrics
                  </Text>
                </View>
              </View>
              <Text className="text-foreground text-xl">→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
