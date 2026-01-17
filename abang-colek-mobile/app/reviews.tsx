import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useMemo, useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { useAppData } from "@/hooks/use-app-data";
import { useColors } from "@/hooks/use-colors";
import { createId } from "@/lib/utils";
import type { Review, Testimonial } from "@/lib/types";

export default function ReviewsScreen() {
  const colors = useColors();
  const { data, update } = useAppData();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [form, setForm] = useState({
    sales: "",
    views: "",
    engagement: "",
    notes: "",
  });
  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    quote: "",
    source: "",
  });

  const events = data.events;
  const reviews = data.reviews;
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveReview = async () => {
    if (!selectedEvent) return;
    const now = new Date().toISOString();
    const review: Review = {
      id: createId("review"),
      eventId: selectedEvent.id,
      sales: Number(form.sales || 0),
      views: Number(form.views || 0),
      engagement: Number(form.engagement || 0),
      topHooks: [],
      issues: form.notes || undefined,
      createdAt: now,
    };
    await update((current) => ({
      ...current,
      reviews: [review, ...current.reviews],
    }));
    setForm({ sales: "", views: "", engagement: "", notes: "" });
    setSelectedEventId(null);
  };

  const addTestimonial = async () => {
    if (!testimonialForm.name || !testimonialForm.quote) return;
    const entry: Testimonial = {
      id: createId("test"),
      customerName: testimonialForm.name,
      quote: testimonialForm.quote,
      source: testimonialForm.source || undefined,
      createdAt: new Date().toISOString(),
    };
    await update((current) => ({
      ...current,
      testimonials: [entry, ...current.testimonials],
    }));
    setTestimonialForm({ name: "", quote: "", source: "" });
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="p-6 gap-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Reviews & Analytics</Text>
            <Text className="text-sm text-muted">
              Capture event results and performance notes
            </Text>
          </View>

          <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
            <Text className="text-lg font-semibold text-foreground">New Review</Text>
            <View className="gap-2">
              {events.length === 0 ? (
                <Text className="text-sm text-muted">Add an event first.</Text>
              ) : (
                events.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    onPress={() => setSelectedEventId(event.id)}
                    className={`rounded-xl border px-3 py-2 ${
                      selectedEventId === event.id ? "bg-primary border-primary" : "bg-background border-border"
                    }`}
                  >
                    <Text className={`text-sm ${selectedEventId === event.id ? "text-foreground" : "text-muted"}`}>
                      {event.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            <TextInput
              placeholder="Sales (RM)"
              placeholderTextColor={colors.muted}
              value={form.sales}
              onChangeText={(value) => updateField("sales", value)}
              keyboardType="numeric"
              className="bg-background rounded-xl p-3 text-sm text-foreground"
              style={{ outlineStyle: "none" } as any}
            />
            <TextInput
              placeholder="Views"
              placeholderTextColor={colors.muted}
              value={form.views}
              onChangeText={(value) => updateField("views", value)}
              keyboardType="numeric"
              className="bg-background rounded-xl p-3 text-sm text-foreground"
              style={{ outlineStyle: "none" } as any}
            />
            <TextInput
              placeholder="Engagement (%)"
              placeholderTextColor={colors.muted}
              value={form.engagement}
              onChangeText={(value) => updateField("engagement", value)}
              keyboardType="numeric"
              className="bg-background rounded-xl p-3 text-sm text-foreground"
              style={{ outlineStyle: "none" } as any}
            />
            <TextInput
              placeholder="Issues / learnings"
              placeholderTextColor={colors.muted}
              value={form.notes}
              onChangeText={(value) => updateField("notes", value)}
              className="bg-background rounded-xl p-3 text-sm text-foreground"
              multiline
              style={{ minHeight: 90, textAlignVertical: "top", outlineStyle: "none" } as any}
            />
            <TouchableOpacity
              onPress={saveReview}
              disabled={!selectedEvent}
              style={{ opacity: selectedEvent ? 1 : 0.5 }}
              className="bg-foreground rounded-xl p-3 items-center"
            >
              <Text className="text-sm font-semibold text-background">Save Review</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Review History ({reviews.length})
            </Text>
            {reviews.length === 0 ? (
              <View className="bg-surface rounded-2xl p-6 items-center gap-2">
                <Text className="text-4xl">📊</Text>
                <Text className="text-base font-semibold text-foreground">No reviews yet</Text>
                <Text className="text-sm text-muted text-center">
                  Add a review after each event to track growth.
                </Text>
              </View>
            ) : (
              reviews.map((review) => {
                const eventName = events.find((event) => event.id === review.eventId)?.name ?? "Unknown event";
                return (
                  <View key={review.id} className="bg-surface rounded-2xl p-4 border border-border gap-2">
                    <Text className="text-base font-semibold text-foreground">{eventName}</Text>
                    <Text className="text-xs text-muted">Sales RM {review.sales}</Text>
                    <Text className="text-xs text-muted">Views {review.views}</Text>
                    <Text className="text-xs text-muted">Engagement {review.engagement}%</Text>
                    {review.issues ? (
                      <Text className="text-xs text-muted">Notes: {review.issues}</Text>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>

          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">"Jatuh Cinta" Moments</Text>
            <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
              <Text className="text-sm font-semibold text-foreground">Add Testimonial</Text>
              <TextInput
                placeholder="Customer name"
                placeholderTextColor={colors.muted}
                value={testimonialForm.name}
                onChangeText={(value) => setTestimonialForm((prev) => ({ ...prev, name: value }))}
                className="bg-background rounded-xl p-3 text-sm text-foreground"
                style={{ outlineStyle: "none" } as any}
              />
              <TextInput
                placeholder="Customer quote"
                placeholderTextColor={colors.muted}
                value={testimonialForm.quote}
                onChangeText={(value) => setTestimonialForm((prev) => ({ ...prev, quote: value }))}
                className="bg-background rounded-xl p-3 text-sm text-foreground"
                style={{ outlineStyle: "none" } as any}
              />
              <TextInput
                placeholder="Source (optional)"
                placeholderTextColor={colors.muted}
                value={testimonialForm.source}
                onChangeText={(value) => setTestimonialForm((prev) => ({ ...prev, source: value }))}
                className="bg-background rounded-xl p-3 text-sm text-foreground"
                style={{ outlineStyle: "none" } as any}
              />
              <TouchableOpacity
                onPress={addTestimonial}
                className="bg-primary rounded-xl p-3 items-center"
              >
                <Text className="text-sm font-semibold text-foreground">Save Testimonial</Text>
              </TouchableOpacity>
            </View>

            {data.testimonials.length === 0 ? (
              <View className="bg-surface rounded-2xl p-6 items-center gap-2">
                <Text className="text-4xl">💬</Text>
                <Text className="text-base font-semibold text-foreground">No testimonials yet</Text>
                <Text className="text-sm text-muted text-center">
                  Capture customer love stories here.
                </Text>
              </View>
            ) : (
              data.testimonials.map((item) => (
                <View key={item.id} className="bg-surface rounded-2xl p-4 border border-border gap-1">
                  <Text className="text-sm text-foreground">"{item.quote}"</Text>
                  <Text className="text-xs text-muted">— {item.customerName}</Text>
                  {item.source ? <Text className="text-xs text-muted">Source: {item.source}</Text> : null}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
