import { View } from "react-native";
import LoginScreen from "./LoginScreen";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LoginScreen />
    </View>
  );
}
