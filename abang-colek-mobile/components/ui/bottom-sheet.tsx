import { Modal, Text, TouchableOpacity, View } from "react-native";

type BottomSheetProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function BottomSheet({ title, open, onClose, children }: BottomSheetProps) {
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <TouchableOpacity className="flex-1" onPress={onClose} />
        <View className="bg-background rounded-t-3xl p-5 border border-border">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-sm text-primary">Close</Text>
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}
