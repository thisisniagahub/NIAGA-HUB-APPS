import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAudioPlayer } from "expo-audio";

import { ScreenContainer } from "@/components/screen-container";
import { ChecklistItemRow } from "@/components/checklist-item";
import { useAppData } from "@/hooks/use-app-data";
import { useColors } from "@/hooks/use-colors";
import { createId } from "@/lib/utils";
import type { BoothChecklist, ChecklistItem, Event, EventStatus } from "@/lib/types";

type ChecklistSection = "preEvent" | "duringEvent" | "postEvent";

const statusOrder: EventStatus[] = ["lead", "confirmed", "completed"];
const jingleSource = require("@/assets/audio/abang-colek-jingle.mp3");

export default function EventDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading, error, update } = useAppData();
  const musicPlayer = useAudioPlayer(jingleSource);
  const [drafts, setDrafts] = useState<Record<ChecklistSection, string>>({
    preEvent: "",
    duringEvent: "",
    postEvent: "",
  });

  const event = useMemo(() => data.events.find((item) => item.id === id), [data.events, id]);
  const checklist = useMemo(
    () => data.checklists.find((item) => item.eventId === id),
    [data.checklists, id],
  );

  useEffect(() => {
    if (!event || checklist) return;
    const now = new Date().toISOString();
    const freshChecklist: BoothChecklist = {
      id: createId("checklist"),
      eventId: event.id,
      preEvent: [],
      duringEvent: [],
      postEvent: [],
    };
    update((current) => ({
      ...current,
      checklists: [freshChecklist, ...current.checklists],
      events: current.events.map((item) =>
        item.id === event.id ? { ...item, updatedAt: now } : item,
      ),
    })).catch(() => undefined);
  }, [checklist, event, update]);

  useEffect(() => {
    if (!data.settings.backgroundMusic) {
      musicPlayer.pause();
      return;
    }
    musicPlayer.play();
    return () => {
      musicPlayer.pause();
    };
  }, [data.settings.backgroundMusic, musicPlayer]);

  useEffect(() => {
    return () => {
      musicPlayer.pause();
      musicPlayer.release();
    };
  }, [musicPlayer]);

  const setDraft = (section: ChecklistSection, value: string) => {
    setDrafts((prev) => ({ ...prev, [section]: value }));
  };

  const toggleChecklist = async (section: ChecklistSection, itemId: string) => {
    if (!checklist) return;
    await update((current) => ({
      ...current,
      checklists: current.checklists.map((item) => {
        if (item.id !== checklist.id) return item;
        return {
          ...item,
          [section]: item[section].map((entry) =>
            entry.id === itemId ? { ...entry, completed: !entry.completed } : entry,
          ),
        };
      }),
    }));
  };

  const addChecklistItem = async (section: ChecklistSection) => {
    if (!checklist) return;
    const text = drafts[section].trim();
    if (!text) return;
    const nextItem: ChecklistItem = {
      id: createId("task"),
      text,
      completed: false,
    };
    await update((current) => ({
      ...current,
      checklists: current.checklists.map((item) => {
        if (item.id !== checklist.id) return item;
        return {
          ...item,
          [section]: [nextItem, ...item[section]],
        };
      }),
    }));
    setDraft(section, "");
  };

  const cycleStatus = async (target: Event) => {
    const next = statusOrder[(statusOrder.indexOf(target.status) + 1) % statusOrder.length];
    await update((current) => ({
      ...current,
      events: current.events.map((item) =>
        item.id === target.id ? { ...item, status: next, updatedAt: new Date().toISOString() } : item,
      ),
    }));
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-3 text-sm text-muted">Loading event...</Text>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-base font-semibold text-foreground">Unable to load event</Text>
        <Text className="text-sm text-muted">{error.message}</Text>
      </ScreenContainer>
    );
  }

  if (!event) {
    return (
      <ScreenContainer className="items-center justify-center gap-3">
        <Text className="text-4xl">😵</Text>
        <Text className="text-base font-semibold text-foreground">Event not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary px-4 py-2 rounded-full"
        >
          <Text className="text-sm font-semibold text-foreground">Go back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="p-6 gap-6">
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">{event.name}</Text>
            <Text className="text-sm text-muted">
              {event.date} • {event.location}
            </Text>
            <TouchableOpacity
              onPress={() => cycleStatus(event)}
              className="self-start bg-surface border border-border px-3 py-1 rounded-full"
            >
              <Text className="text-xs font-semibold text-foreground">
                Status: {event.status}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-surface rounded-2xl p-4 border border-border gap-2">
            <Text className="text-base font-semibold text-foreground">Event Info</Text>
            <Text className="text-sm text-muted">Fee: RM {event.fee}</Text>
            <Text className="text-sm text-muted">
              EO: {event.eoContact.name} • {event.eoContact.phone}
            </Text>
            {event.eoContact.email ? (
              <Text className="text-sm text-muted">Email: {event.eoContact.email}</Text>
            ) : null}
            {event.requirements ? (
              <Text className="text-sm text-muted">Requirements: {event.requirements}</Text>
            ) : null}
            {event.notes ? (
              <Text className="text-sm text-muted">Notes: {event.notes}</Text>
            ) : null}
            <TouchableOpacity
              onPress={() =>
                update((current) => ({
                  ...current,
                  settings: {
                    ...current.settings,
                    backgroundMusic: !current.settings.backgroundMusic,
                  },
                }))
              }
              className="self-start bg-background px-3 py-1 rounded-full border border-border"
            >
              <Text className="text-xs text-foreground">
                Background Music: {data.settings.backgroundMusic ? "On" : "Off"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Booth Ops Checklist</Text>
            {(["preEvent", "duringEvent", "postEvent"] as ChecklistSection[]).map((section) => (
              <View key={section} className="gap-2">
                <Text className="text-sm font-semibold text-foreground">
                  {section === "preEvent"
                    ? "Pre-Event"
                    : section === "duringEvent"
                      ? "During Event"
                      : "Post-Event"}
                </Text>
                <View className="gap-2">
                  {(checklist?.[section] ?? []).map((item) => (
                    <ChecklistItemRow
                      key={item.id}
                      item={item}
                      onToggle={(itemId) => toggleChecklist(section, itemId)}
                    />
                  ))}
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      placeholder="Add checklist item"
                      placeholderTextColor={colors.muted}
                      value={drafts[section]}
                      onChangeText={(value) => setDraft(section, value)}
                      className="flex-1 bg-surface rounded-xl p-3 text-sm text-foreground border border-border"
                      style={{ outlineStyle: "none" } as any}
                    />
                    <TouchableOpacity
                      onPress={() => addChecklistItem(section)}
                      className="bg-primary rounded-xl px-4 py-3"
                    >
                      <Text className="text-sm font-semibold text-foreground">Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
