import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Linking from "expo-linking";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";

import "../global.css";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [scannedData, setScannedData] = useState<string | null>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScannedData(data);
  };

  const isURL = (text: string) => /^https?:\/\//.test(text);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (!permission)
    return (
      <View className="flex-1 w-full justify-center items-center bg-black" />
    );
  if (!permission.granted) {
    return (
      <View className="flex-1 w-full justify-center items-center bg-black">
        <Text className="text-white mb-4 text-lg">Kameraya icazə lazımdır</Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-blue-600 px-4 py-2 rounded-xl"
        >
          <Text className="text-white">İcazə ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (scannedData) {
    return (
      <View className="flex-1 w-full justify-center items-center bg-black px-4">
        <Text className="text-white text-lg mb-6 text-center">
          {isURL(scannedData) ? "URL Tapıldı  :" : "Məlumat Tapılmadı:"}
        </Text>
        <Text className="text-white text-sm mb-4 text-center break-words bg-white">
          {scannedData}
        </Text>

        <View className="flex-row gap-2 ">
          {isURL(scannedData) && (
            <TouchableOpacity
              onPress={() => Linking.openURL(scannedData)}
              className="bg-green-600 px-8 py-3 rounded-xl"
            >
              <Text className="text-white font-bold">Sayta get</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setScannedData(null)}
            className="bg-gray-600 px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-bold">Geri qayıt</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 w-full bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing={facing}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />
      <View className="absolute top-1/4 left-12  w-3/4 h-1/3 items-center justify-center">
        <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-600 rounded-md" />
        <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-600 rounded-md" />
        <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-600 rounded-md" />
        <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-600 rounded-md" />

        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            width: "100%",
            height: 2,
            backgroundColor: "white",
            transform: [
              {
                translateY: scanLineAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 273],
                }),
              },
            ],
          }}
        />
      </View>
      <View className="absolute bottom-5 left-0 right-0 items-center">
        <TouchableOpacity
          onPress={() =>
            setFacing((prev) => (prev === "back" ? "front" : "back"))
          }
          className="bg-blue-600 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-semibold ">
            <MaterialIcons name="cameraswitch" size={45} color="white" />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
