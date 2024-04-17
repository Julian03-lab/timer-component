// React
import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Button } from "react-native";

// Expo
import { Link } from "expo-router";
import * as Notifications from "expo-notifications";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";

// Dependencies
import BackgroundTimer from "react-native-background-timer";

// Component
import FullTimer from "./FullTimer";

const Timer = ({ initialSeconds }: { initialSeconds: number }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [fullTimer, setFullTimer] = useState(false);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [sound, setSound] = useState<Audio.Sound | undefined>();
  const [interval, setInterval] = useState<number | null>(null);

  // UseEffect initial to configure the notification
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }, []);

  // UseEffect to change the state of sound
  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: true,
    });

    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // UseEffect to set interval of timer
  useEffect(() => {
    let intervalId: number;

    if (isRunning) {
      intervalId = BackgroundTimer.setInterval(() => {
        !interval && setInterval(intervalId);
        setSeconds((prevSeconds) => {
          if (prevSeconds === 1 || prevSeconds < 0) {
            playSound();
            sendNotification();
            BackgroundTimer.clearInterval(intervalId);
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }

    return () => BackgroundTimer.clearInterval(intervalId);
  }, [isRunning]);

  // Handle Start
  const startTimer = async () => {
    setIsRunning(true);
    // await registerForPushNotificationsAsync();
  };

  // Handle Pause
  const pauseTimer = () => {
    setIsRunning(false);
  };

  // Handle Reset
  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(initialSeconds);
  };

  // Handle Stop
  const stopTimer = () => {
    if (interval) {
      BackgroundTimer.clearInterval(interval);
      setIsRunning(false);
      setSeconds(initialSeconds);
      stopSound();
    }
  };

  // Handle to start the sound
  async function playSound() {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/alarm.wav")
    );
    setSound(sound);

    console.log("Playing Sound");
    await sound.setVolumeAsync(1);
    await sound.setIsLoopingAsync(true);
    await sound.playAsync();

    // Stop Sound if the limit of a time is pass (15 second)
    BackgroundTimer.setTimeout(async () => {
      if (sound) {
        sound.unloadAsync();
      }
    }, 15000);
  }

  // Handle to stop the sound
  async function stopSound() {
    if (sound) {
      console.log("Stopping Sound");
      await sound.stopAsync();
    }
  }

  // Handle to send notification
  const sendNotification = async () => {
    // Verify if had permission
    const settings = await Notifications.getPermissionsAsync();
    if (
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    ) {
      const res = await Notifications.scheduleNotificationAsync({
        identifier: "test",
        content: {
          title: "You've got mail! 📬",
          body: "Here is the notification body",
          data: { data: "goes here" },
        },
        trigger: { seconds: 2 },
      });
      console.log(
        "Sending notification: ",
        res,
        await Notifications.getPermissionsAsync()
      );
    }
  };

  // Format  time in MM:SS format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(Math.abs(seconds) / 60);
    const remainingSeconds = Math.abs(seconds) % 60;
    const formattedMinutes = seconds < 0 ? `-${minutes}` : minutes;
    const formattedSeconds =
      remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  console.log(seconds);

  return (
    <>
      {fullTimer && (
        <FullTimer
          isRunning={isRunning}
          remainingSeconds={seconds}
          handlePlay={startTimer}
          handleStop={stopTimer}
          handlePause={pauseTimer}
          handleReset={resetTimer}
          setFullTimer={setFullTimer}
        />
      )}
      <View style={styles.container}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        <View style={styles.controls}>
          {!isRunning ? (
            <>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={startTimer}
              >
                <Text style={styles.controlButtonText}>▶️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={resetTimer}
              >
                <Text style={styles.controlButtonText}>🔁</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={pauseTimer}
                disabled={seconds === 0}
              >
                <Text style={styles.controlButtonText}>⏸️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={stopTimer}
              >
                <Text style={styles.controlButtonText}>⏹️</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setFullTimer(true)}
          >
            <Text style={styles.controlButtonText}>↗️</Text>
          </TouchableOpacity>
        </View>
        {/* <Button title="Test notif" onPress={sendNotification} color="#007bff" /> */}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    paddingVertical: 20,
    borderColor: "#007bff",
    borderWidth: 2,
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 8,
  },
  timerText: {
    fontSize: 50,
  },
  controls: {
    flexDirection: "row",
    gap: 10,
  },
  controlButton: {
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

export default Timer;
