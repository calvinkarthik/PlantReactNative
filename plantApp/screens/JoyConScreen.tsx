import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BrandColors } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { Joystick } from '@/components/Joystick';
import { VideoFeedStub } from '@/components/VideoFeedStub';
import useTelemetry from '@/hooks/useTelemetry';

export function JoyConScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { robot, updateRobotVector, toggleRobotConnection } = useAppStore();
  const [isRunning, setIsRunning] = useState(false);
  const [lightOn, setLightOn] = useState(false);
  const [hornOn, setHornOn] = useState(false);

  // telemetry hook: send x/y to Pi telemetry WebSocket
  const { connected: telemetryConnected, sendXY } = useTelemetry();

  const handleVectorChange = (x: number, y: number) => {
    updateRobotVector(x, y);
    // send coordinates to Pi (best-effort)
    try {
      sendXY(Math.round(x * 100) / 100, Math.round(y * 100) / 100);
    } catch (e) {
      // ignore send errors for now
    }
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleCenter = () => {
    updateRobotVector(0, 0);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}
      edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Robot Control
          </Text>
          <TouchableOpacity
            style={[
              styles.connectionBadge,
              {
                backgroundColor: robot.connected
                  ? 'rgba(76, 175, 80, 0.2)'
                  : 'rgba(244, 67, 54, 0.2)',
              },
            ]}
            onPress={toggleRobotConnection}
            activeOpacity={0.7}>
            <View
              style={[
                styles.connectionDot,
                { backgroundColor: robot.connected ? '#4CAF50' : '#F44336' },
              ]}
            />
            <Text
              style={[
                styles.connectionText,
                { color: robot.connected ? '#4CAF50' : '#F44336' },
              ]}>
              {robot.connected ? 'Connected' : 'Disconnected'} (stub)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.videoSection}>
          <VideoFeedStub />
        </View>

        <View style={styles.controlSection}>
          <View style={styles.joystickContainer}>
            <Joystick onVectorChange={handleVectorChange} size={180} />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                {
                  backgroundColor: isRunning ? '#4CAF50' : isDark ? Colors.dark.card : Colors.light.card,
                },
              ]}
              onPress={handleStartStop}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.controlButtonText,
                  { color: isRunning ? '#FFF' : isDark ? Colors.dark.text : Colors.light.text },
                ]}>
                {isRunning ? 'Stop' : 'Start'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: isDark ? Colors.dark.card : Colors.light.card },
              ]}
              onPress={handleCenter}
              activeOpacity={0.7}>
              <Text style={[styles.controlButtonText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Center
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                {
                  backgroundColor: lightOn ? '#FFC107' : isDark ? Colors.dark.card : Colors.light.card,
                },
              ]}
              onPress={() => setLightOn(!lightOn)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.controlButtonText,
                  { color: lightOn ? '#000' : isDark ? Colors.dark.text : Colors.light.text },
                ]}>
                💡 Light
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                {
                  backgroundColor: hornOn ? BrandColors.amethyst : isDark ? Colors.dark.card : Colors.light.card,
                },
              ]}
              onPress={() => setHornOn(!hornOn)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.controlButtonText,
                  { color: hornOn ? '#FFF' : isDark ? Colors.dark.text : Colors.light.text },
                ]}>
                📢 Horn
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  videoSection: {
    marginBottom: 20,
  },
  controlSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  joystickContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
