import { Mic, Square } from 'lucide-react-native';
import React from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

import colors from '@/components/ui/colors';

interface RecordButtonProps {
  isRecording: boolean;
  onPress: () => void;
}

export default function RecordButton({
  isRecording,
  onPress,
}: RecordButtonProps) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  return (
    <View className="size-[70px] items-center justify-center">
      {isRecording && (
        <Animated.View
          className="bg-error absolute size-[60px] rounded-full"
          style={[
            {
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.2],
                outputRange: [0.7, 0],
              }),
            },
          ]}
        />
      )}
      <TouchableOpacity
        className={`size-[60px] items-center justify-center rounded-full shadow-lg ${
          isRecording ? 'bg-red-200' : 'bg-primary-400'
        }`}
        onPress={onPress}
      >
        {isRecording ? (
          <Square size={24} color={colors.white} />
        ) : (
          <Mic size={24} color={colors.white} />
        )}
      </TouchableOpacity>
    </View>
  );
}
