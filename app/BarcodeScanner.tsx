import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { btoa } from "react-native-quick-base64";

import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export default function BarcodeScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [scannedData, setScannedData] = useState<string | null>(null);
  const router = useRouter();

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
  const URL = "https://facecardapi.azurewebsites.net/";

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

  const handleLogout = async () => {
    Alert.alert(
      "Çıxmaq istəyirsinizmi?",
      "Çıxış etmək istədiyinizə əmin olun.",
      [
        { text: "Xeyr", style: "cancel" },
        {
          text: "Bəli",
          onPress: async () => {
            await AsyncStorage.removeItem("token");
            router.replace("/LoginScreen");
          },
        },
      ]
    );
  };

  const sendScannedData = async () => {
    if (!scannedData) {
      Alert.alert("Xəta", "QR məlumatı tapılmadı.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const base64 = btoa(scannedData);

      console.log(base64);

      const response = await axios.post(
        `${URL}api/qrcodes/scanned?qrData=${base64}&branchId=1`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const userData = response.data;

      Alert.alert("Uğurla Göndərildi!");

      setScannedData(null);
    } catch (error: any) {
      console.error(error);
      if (error.response) {
        Alert.alert(
          "Xəta",
          error.response.data?.message || "Məlumat göndərilmədi."
        );
      } else {
        Alert.alert("Xəta", "Serverə qoşulmaq mümkün olmadı.");
      }
    }
  };

  if (!permission)
    return (
      <SafeAreaView className="flex-1 w-full justify-center items-center bg-black" />
    );

  if (!permission.granted) {
    return (
      <View className="flex-1 w-full justify-center items-center bg-black">
        <Text className="text-white mb-4 text-lg">Kameraya icazə lazımdır</Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-green-600 px-4 py-2 rounded-xl"
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
          {scannedData?.trim()
            ? isURL(scannedData)
              ? "URL Tapıldı:"
              : "Məlumat Tapıldı:"
            : "Məlumat Tapılmadı"}
        </Text>

        <Text className="text-white text-sm mb-4 text-center break-words">
          {scannedData}
        </Text>

        <View className="flex-row gap-2 flex-wrap justify-center">
          {isURL(scannedData) && (
            <TouchableOpacity
              onPress={() => Linking.openURL(scannedData)}
              className="bg-green-600 px-8 py-3 rounded-xl"
            >
              <Text className="text-white font-bold">Sayta get</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={sendScannedData}
            className="bg-blue-600 px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-bold">Göndər</Text>
          </TouchableOpacity>

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

      <View className="absolute top-5 right-3 flex-row gap-4">
        <TouchableOpacity onPress={handleLogout}>
          <MaterialIcons name="logout" size={35} color="white" />
        </TouchableOpacity>
      </View>

      <View className="absolute  bottom-5 left-0 right-0 items-center">
        <TouchableOpacity
          onPress={() =>
            setFacing((prev) => (prev === "back" ? "front" : "back"))
          }
          className="bg-blue-600 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-semibold">
            <MaterialIcons name="cameraswitch" size={45} color="white" />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
