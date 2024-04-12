import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Button } from "react-native";
import BackgroundTimer from "react-native-background-timer";
import * as Notifications from "expo-notifications";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import { Link } from "expo-router";
import FullTimer from "./FullTimer";

const Timer = ({ initialSeconds }: { initialSeconds: number }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | undefined>();
  const [interval, setInterval] = useState<number | null>(null);
  const [fullTimer, setFullTimer] = useState(false);

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
  }

  async function stopSound() {
    if (sound) {
      console.log("Stopping Sound");
      await sound.stopAsync();
    }
  }

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

  useEffect(() => {
    let intervalId: number;

    if (isRunning) {
      intervalId = BackgroundTimer.setInterval(() => {
        !interval && setInterval(intervalId);
        setSeconds((prevSeconds) => {
          if (prevSeconds === 1) {
            playSound();
            sendNotification();
            return prevSeconds - 1;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }

    return () => BackgroundTimer.clearInterval(intervalId);
  }, [isRunning]);

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

  const startTimer = async () => {
    setIsRunning(true);
    // await registerForPushNotificationsAsync();
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(initialSeconds);
  };

  const stopTimer = () => {
    if (interval) {
      BackgroundTimer.clearInterval(interval);
      setIsRunning(false);
      setSeconds(initialSeconds);
      stopSound();
    }
  };

  const sendNotification = async () => {
    const res = await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: "Here is the notification body",
        data: { data: "goes here" },
      },
      trigger: { seconds: 2 },
    });
    console.log("Sending notification: ", res);
  };

  console.log(seconds);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(Math.abs(seconds) / 60);
    const remainingSeconds = Math.abs(seconds) % 60;
    const formattedMinutes = seconds < 0 ? `-${minutes}` : minutes;
    const formattedSeconds =
      remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    return `${formattedMinutes}:${formattedSeconds}`;
  };

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
