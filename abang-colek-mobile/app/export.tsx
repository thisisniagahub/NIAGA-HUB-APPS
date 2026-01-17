import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import * as Clipboard from "expo-clipboard";

import { ScreenContainer } from "@/components/screen-container";
import { useAppData } from "@/hooks/use-app-data";
import { useColors } from "@/hooks/use-colors";
import { exportAppData, importAppData } from "@/lib/storage";
import { taglines } from "@/lib/preset-data";

export default function ExportScreen() {
  const colors = useColors();
  const { data, refresh } = useAppData();
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const copyPayload = async (payload: unknown, label: string) => {
    const text = JSON.stringify(payload, null, 2);
    await Clipboard.setStringAsync(text);
    setStatus(`${label} copied to clipboard`);
  };

  const handleExportAll = async () => {
    const text = await exportAppData();
    await Clipboard.setStringAsync(text);
    setStatus("Full backup copied to clipboard");
  };

  const handleImport = async () => {
    if (!input.trim()) return;
    await importAppData(input);
    await refresh();
    setInput("");
    setStatus("Backup imported successfully");
  };

  const eventPack = {
    events: data.events,
    checklists: data.checklists,
    contentPlans: data.contentPlans,
    reviews: data.reviews,
  };

  const tiktokPack = {
    hooks: data.hooks,
    taglines,
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="p-6 gap-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Export & Backup</Text>
            <Text className="text-sm text-muted">
              Copy JSON packs for backup or sharing
            </Text>
          </View>

          <View className="gap-3">
            <TouchableOpacity
              onPress={handleExportAll}
              className="bg-primary rounded-xl p-4 items-center"
            >
              <Text className="text-base font-semibold text-foreground">Export Full Backup</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => copyPayload(eventPack, "Event Pack")}
              className="bg-surface rounded-xl p-4 border border-border items-center"
            >
              <Text className="text-base font-semibold text-foreground">Export Event Pack</Text>
              <Text className="text-xs text-muted">Events, checklists, content plans, reviews</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => copyPayload(tiktokPack, "TikTok Pack")}
              className="bg-surface rounded-xl p-4 border border-border items-center"
            >
              <Text className="text-base font-semibold text-foreground">Export TikTok Pack</Text>
              <Text className="text-xs text-muted">Hooks + taglines</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Import Backup</Text>
            <TextInput
              placeholder="Paste JSON backup here..."
              placeholderTextColor={colors.muted}
              value={input}
              onChangeText={setInput}
              multiline
              className="bg-surface rounded-xl p-4 border border-border text-sm text-foreground"
              style={{ minHeight: 160, textAlignVertical: "top", outlineStyle: "none" } as any}
            />
            <TouchableOpacity
              onPress={handleImport}
              className="bg-foreground rounded-xl p-4 items-center"
            >
              <Text className="text-base font-semibold text-background">Import Backup</Text>
            </TouchableOpacity>
          </View>

          {status ? (
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-sm text-foreground">{status}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
