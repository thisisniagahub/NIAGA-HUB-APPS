import { ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";

export default function WhatsAppAnalyticsScreen() {
  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="p-6 gap-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Bot Analytics</Text>
            <Text className="text-sm text-muted">Performance overview</Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-foreground">127</Text>
              <Text className="text-xs text-muted mt-1">Messages Today</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-success">94%</Text>
              <Text className="text-xs text-muted mt-1">Auto-Reply Rate</Text>
            </View>
          </View>

          <View className="bg-surface rounded-2xl p-5 border border-border gap-2">
            <Text className="text-lg font-semibold text-foreground">Top Topics</Text>
            <Text className="text-sm text-muted">Customer service • Lucky draw • Event registration</Text>
          </View>

          <View className="bg-surface rounded-2xl p-5 border border-border gap-2">
            <Text className="text-lg font-semibold text-foreground">Peak Hours</Text>
            <Text className="text-sm text-muted">12PM - 2PM • 7PM - 9PM</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
