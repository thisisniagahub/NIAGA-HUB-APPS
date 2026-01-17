import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useAppData } from "@/hooks/use-app-data";
import { useColors } from "@/hooks/use-colors";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { createId } from "@/lib/utils";
import type { Event, EventStatus } from "@/lib/types";
import { EventCard } from "@/components/event-card";

export default function EventsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data, loading, error, refresh, update } = useAppData();
  const { playClick } = useSoundEffects();
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    date: "",
    location: "",
    fee: "",
    eoName: "",
    eoPhone: "",
    eoEmail: "",
    requirements: "",
    notes: "",
  });

  const statusOrder: EventStatus[] = useMemo(() => ["lead", "confirmed", "completed"], []);
  const events = data.events;

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      date: "",
      location: "",
      fee: "",
      eoName: "",
      eoPhone: "",
      eoEmail: "",
      requirements: "",
      notes: "",
    });
  };

  const cycleStatus = async (event: Event) => {
    const currentIndex = statusOrder.indexOf(event.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    if (data.settings.haptics && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    playClick();
    await update((current) => ({
      ...current,
      events: current.events.map((item) =>
        item.id === event.id ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() } : item,
      ),
    }));
  };

  const submitEvent = async () => {
    if (!form.name || !form.date || !form.location || !form.eoName || !form.eoPhone) {
      return;
    }
    if (data.settings.haptics && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    playClick();
    const now = new Date().toISOString();
    const nextEvent: Event = {
      id: createId("event"),
      name: form.name,
      date: form.date,
      location: form.location,
      fee: Number(form.fee || 0),
      status: "lead",
      eoContact: {
        name: form.eoName,
        phone: form.eoPhone,
        email: form.eoEmail || undefined,
      },
      requirements: form.requirements || undefined,
      notes: form.notes || undefined,
      createdAt: now,
      updatedAt: now,
    };
    await update((current) => ({
      ...current,
      events: [nextEvent, ...current.events],
    }));
    resetForm();
    setIsCreating(false);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        <View className="gap-4">
          <View className="p-6 gap-2">
            <Text className="text-3xl font-bold text-foreground">Events Pipeline</Text>
            <Text className="text-base text-muted">
              Manage your event bookings from lead to completion
            </Text>
          </View>

          {loading && events.length === 0 ? (
            <View className="items-center justify-center py-12 gap-3">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-sm text-muted">Loading events...</Text>
            </View>
          ) : null}

          {error ? (
            <View className="mx-6 bg-surface rounded-2xl p-5 border border-border gap-2">
              <Text className="text-base font-semibold text-foreground">Failed to load events</Text>
              <Text className="text-sm text-muted">{error.message}</Text>
              <TouchableOpacity
                onPress={refresh}
                className="self-start bg-primary rounded-full px-4 py-2"
              >
                <Text className="text-sm font-semibold text-foreground">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Quick Create */}
          <View className="mx-6 bg-surface rounded-2xl p-5 border border-border gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">Add New Event</Text>
              <TouchableOpacity onPress={() => setIsCreating((prev) => !prev)}>
                <Text className="text-sm text-primary">{isCreating ? "Close" : "Create"}</Text>
              </TouchableOpacity>
            </View>
            {isCreating ? (
              <View className="gap-3">
                <TextInput
                  placeholder="Event name"
                  placeholderTextColor={colors.muted}
                  value={form.name}
                  onChangeText={(value) => updateField("name", value)}
                  className="bg-background rounded-xl p-3 text-base text-foreground"
                  style={{ outlineStyle: "none" } as any}
                />
                <TextInput
                  placeholder="Event date (YYYY-MM-DD)"
                  placeholderTextColor={colors.muted}
                  value={form.date}
                  onChangeText={(value) => updateField("date", value)}
                  className="bg-background rounded-xl p-3 text-base text-foreground"
                  style={{ outlineStyle: "none" } as any}
                />
                <TextInput
                  placeholder="Location"
                  placeholderTextColor={colors.muted}
                  value={form.location}
                  onChangeText={(value) => updateField("location", value)}
                  className="bg-background rounded-xl p-3 text-base text-foreground"
                  style={{ outlineStyle: "none" } as any}
                />
                <TextInput
                  placeholder="Fee (RM)"
                  placeholderTextColor={colors.muted}
                  value={form.fee}
                  onChangeText={(value) => updateField("fee", value)}
                  keyboardType="numeric"
                  className="bg-background rounded-xl p-3 text-base text-foreground"
                  style={{ outlineStyle: "none" } as any}
                />
                <TextInput
                  placeholder="EO contact name"
                  placeholderTextColor={colors.muted}
                  value={form.eoName}
                  onChangeText={(value) => updateField("eoName", value)}
                  className="bg-background rounded-xl p-3 text-base text-foreground"
                  style={{ outlineStyle: "none" } as any}
                />
                <TextInput
                  placeholder="EO contact phone"
                  placeholderTextColor={colors.muted}
                  value={form.eoPhone}
                  onChangeText={(value) => updateField("eoPhone", value)}
                  keyboardType="phone-pad"
                  className="bg-background rounded-xl p-3 text-base text-foreground"
                  style={{ outlineStyle: "none" } as any}
                />
                <TextInput
                  placeholder="EO contact email (optional)"
                  placeholderTextColor={colors.muted}
                  value={form.eoEmail}
                  onChangeText={(value) => updateField("eoEmail", value)}
                  keyboardType="email-address"
                  className="bg-background rounded-xl p-3 text-base text-foreground"
                  style={{ outlineStyle: "none" } as any}
                />
                <TextInput
                  placeholder="Event requirements (optional)"
                  placeholderTextColor={colors.muted}
                  value={form.requirements}
                  onChangeText={(value) => updateField("requirements", value)}
                  className="bg-background rounded-xl p-3 text-base text-foreground"
                  style={{ outlineStyle: "none" } as any}
                />
                <TextInput
                  placeholder="Notes (optional)"
                  placeholderTextColor={colors.muted}
                  value={form.notes}
                  onChangeText={(value) => updateField("notes", value)}
                  className="bg-background rounded-xl p-3 text-base text-foreground"
                  multiline
                  style={{ minHeight: 80, textAlignVertical: "top", outlineStyle: "none" } as any}
                />
                <TouchableOpacity
                  onPress={submitEvent}
                  className="bg-primary rounded-xl p-3 items-center"
                >
                  <Text className="text-base font-semibold text-foreground">Save Event</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text className="text-sm text-muted">
                Create a new event with lead status, then manage pipeline states.
              </Text>
            )}
          </View>

          {/* Events List */}
          <View className="px-6 gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Active Events ({events.length})
            </Text>
            {events.length === 0 && !loading ? (
              <View className="bg-surface rounded-2xl p-8 items-center gap-2">
                <Text className="text-4xl">📅</Text>
                <Text className="text-base font-semibold text-foreground">No events yet</Text>
                <Text className="text-sm text-muted text-center">
                  Add your first event to start tracking your pipeline.
                </Text>
              </View>
            ) : null}

            {events.map((event) => (
              <Swipeable
                key={event.id}
                renderRightActions={() => (
                  <TouchableOpacity
                    onPress={() => cycleStatus(event)}
                    className="justify-center px-4 bg-success rounded-2xl ml-2"
                  >
                    <Text className="text-sm font-semibold text-white">Next Status</Text>
                  </TouchableOpacity>
                )}
              >
                <EventCard
                  event={event}
                  onPress={() => router.push(`/events/${event.id}`)}
                  onStatusPress={() => cycleStatus(event)}
                />
              </Swipeable>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
