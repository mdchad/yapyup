import { Mic, Square } from 'lucide-react-native';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

import Colors from '@/lib/constants/colors';

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
    <View style={styles.container}>
      {isRecording && (
        <Animated.View
          style={[
            styles.pulse,
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
        style={[styles.button, isRecording ? styles.recordingButton : null]}
        onPress={onPress}
      >
        {isRecording ? (
          <Square size={24} color={Colors.white} />
        ) : (
          <Mic size={24} color={Colors.white} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
  },
  button: {
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  recordingButton: {
    backgroundColor: Colors.error,
  },
  pulse: {
    position: 'absolute',
    backgroundColor: Colors.error,
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});
