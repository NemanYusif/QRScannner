import { View } from "react-native";
import BarcodeScanner from "./BarcodeScanner";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <BarcodeScanner />
    </View>
  );
}
