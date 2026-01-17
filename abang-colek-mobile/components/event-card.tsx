import { Text, TouchableOpacity, View } from "react-native";

import type { Event, EventStatus } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";

type EventCardProps = {
  event: Event;
  onPress?: () => void;
  onStatusPress?: () => void;
};

const statusTone: Record<EventStatus, "warning" | "primary" | "success"> = {
  lead: "warning",
  confirmed: "primary",
  completed: "success",
};

export function EventCard({ event, onPress, onStatusPress }: EventCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-surface rounded-2xl p-4 border border-border gap-2"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-foreground">{event.name}</Text>
          <Text className="text-sm text-muted">
            {event.date} • {event.location}
          </Text>
        </View>
        <TouchableOpacity onPress={onStatusPress}>
          <StatusBadge label={event.status} tone={statusTone[event.status]} />
        </TouchableOpacity>
      </View>
      <Text className="text-xs text-muted">
        EO: {event.eoContact.name} • {event.eoContact.phone}
      </Text>
    </TouchableOpacity>
  );
}
