import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

export default function WocsPanelScreen() {
  const colors = useColors();
  const tasksQuery = trpc.wocs.list.useQuery(undefined, { refetchInterval: 5000 });
  const statsQuery = trpc.wocs.stats.useQuery(undefined, { refetchInterval: 5000 });
  const approveMutation = trpc.wocs.approve.useMutation();
  const rejectMutation = trpc.wocs.reject.useMutation();
  const runNowMutation = trpc.wocs.runNow.useMutation();
  const rollbackMutation = trpc.wocs.rollback.useMutation();
  const voiceParseMutation = trpc.wocs.voiceParse.useMutation();
  const createMutation = trpc.wocs.create.useMutation();
  const [voiceInput, setVoiceInput] = useState("");

  const tasks = tasksQuery.data ?? [];
  const awaiting = tasks.filter((task) => task.status === "awaiting_approval");
  const pending = tasks.filter((task) => task.status === "pending");

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="p-6 gap-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">WOCS Agent Panel</Text>
            <Text className="text-sm text-muted">Task inbox, approvals, and history</Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-foreground">{statsQuery.data?.pending ?? 0}</Text>
              <Text className="text-xs text-muted mt-1">Pending</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-warning">{statsQuery.data?.awaitingApproval ?? 0}</Text>
              <Text className="text-xs text-muted mt-1">Awaiting</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-success">{statsQuery.data?.done ?? 0}</Text>
              <Text className="text-xs text-muted mt-1">Done</Text>
            </View>
          </View>

          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Awaiting Approval</Text>
            {awaiting.length === 0 ? (
              <Text className="text-sm text-muted">No tasks awaiting approval.</Text>
            ) : (
              awaiting.map((task) => (
                <View key={task.id} className="bg-surface rounded-xl p-4 border border-border gap-2">
                  <Text className="text-sm font-semibold text-foreground">{task.type}</Text>
                  <Text className="text-xs text-muted">{task.commandRaw}</Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => approveMutation.mutate({ id: task.id })}
                      className="flex-1 bg-success rounded-lg py-2 items-center"
                    >
                      <Text className="text-xs font-semibold text-white">Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => rejectMutation.mutate({ id: task.id })}
                      className="flex-1 bg-error rounded-lg py-2 items-center"
                    >
                      <Text className="text-xs font-semibold text-white">Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Voice Commands</Text>
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              <TextInput
                placeholder="Paste voice transcription..."
                placeholderTextColor={colors.muted}
                value={voiceInput}
                onChangeText={setVoiceInput}
                className="bg-background rounded-xl p-3 text-sm text-foreground"
                style={{ outlineStyle: "none" } as any}
              />
              <TouchableOpacity
                onPress={() => voiceParseMutation.mutate({ text: voiceInput })}
                className="bg-foreground rounded-xl p-3 items-center"
              >
                <Text className="text-sm font-semibold text-background">Normalize Command</Text>
              </TouchableOpacity>
              {voiceParseMutation.data?.parsed?.type !== "unknown" ? (
                <View className="bg-background rounded-xl p-3 border border-border gap-2">
                  <Text className="text-sm text-foreground">
                    Parsed type: {voiceParseMutation.data?.parsed?.type}
                  </Text>
                  <Text className="text-xs text-muted">
                    {voiceParseMutation.data?.normalized}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      createMutation.mutate({
                        type: voiceParseMutation.data?.parsed?.type ?? "unknown",
                        commandRaw: voiceParseMutation.data?.normalized ?? "",
                        payload: voiceParseMutation.data?.parsed?.payload ?? {},
                        requiresApproval: voiceParseMutation.data?.parsed?.requiresApproval ?? false,
                      })
                    }
                    className="bg-success rounded-lg py-2 items-center"
                  >
                    <Text className="text-xs font-semibold text-white">Create Task</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>

          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Pending Tasks</Text>
            {pending.length === 0 ? (
              <Text className="text-sm text-muted">No pending tasks.</Text>
            ) : (
              pending.map((task) => (
                <View key={task.id} className="bg-surface rounded-xl p-4 border border-border gap-2">
                  <Text className="text-sm font-semibold text-foreground">{task.type}</Text>
                  <Text className="text-xs text-muted">{task.commandRaw}</Text>
                  <TouchableOpacity
                    onPress={() => runNowMutation.mutate({ id: task.id })}
                    className="bg-foreground rounded-lg py-2 items-center"
                  >
                    <Text className="text-xs font-semibold text-background">Run Now</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">History</Text>
            {tasks.slice(0, 10).map((task) => (
              <View key={task.id} className="bg-surface rounded-xl p-4 border border-border">
                <Text className="text-sm font-semibold text-foreground">
                  {task.type} • {task.status}
                </Text>
                <Text className="text-xs text-muted">{task.commandRaw}</Text>
                {task.status === "failed" ? (
                  <TouchableOpacity
                    onPress={() => rollbackMutation.mutate({ id: task.id })}
                    className="mt-2 self-start bg-warning rounded-lg px-3 py-1"
                  >
                    <Text className="text-xs font-semibold text-white">Rollback</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
