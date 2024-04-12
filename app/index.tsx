import FullTimer from "@/components/FullTimer";
import Timer from "@/components/Timer";
import { View, Text, StyleSheet, Button } from "react-native";

const FirstPage = (): React.JSX.Element => {
  return (
    <View style={styles.container}>
      <Timer initialSeconds={10} />
      <Timer initialSeconds={40} />
      <Timer initialSeconds={110} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 20,
    backgroundColor: "yellow",
  },
});

export default FirstPage;
