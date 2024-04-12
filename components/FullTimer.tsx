import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import BackgroundTimer from "react-native-background-timer";

type FullTimerProps = {
  isRunning: boolean;
  remainingSeconds: number;
  handlePlay: () => void;
  handleStop: () => void;
  handlePause: () => void;
  handleReset: () => void;
  setFullTimer: (value: boolean) => void;
};

const FullTimer = ({
  isRunning,
  remainingSeconds,
  handlePlay,
  handleStop,
  handlePause,
  handleReset,
  setFullTimer,
}: FullTimerProps) => {
  //   const [time, setTime] = useState(remainingSeconds);

  //   useEffect(() => {
  //     let interval: number;

  //     if (isRunning) {
  //       interval = BackgroundTimer.setInterval(() => {
  //         setTime((prevTime) => prevTime - 1);
  //       }, 1000);
  //     }

  //     return () => {
  //       BackgroundTimer.clearInterval(interval);
  //     };
  //   }, [isRunning]);

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>Time: {remainingSeconds} seconds</Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setFullTimer(false)}
        >
          <Text style={styles.controlButtonText}>↙️</Text>
        </TouchableOpacity>
        {!isRunning ? (
          <>
            <TouchableOpacity style={styles.controlButton} onPress={handlePlay}>
              <Text style={styles.controlButtonText}>▶️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleReset}
            >
              <Text style={styles.controlButtonText}>🔁</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handlePause}
            >
              <Text style={styles.controlButtonText}>⏸️</Text>
            </TouchableOpacity>
            <Button title="⏹️" onPress={handleStop} color="#007bff" />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    zIndex: 1,
    backgroundColor: "yellow",
  },
  timeText: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  controlButton: {
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  controlButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
});

export default FullTimer;
