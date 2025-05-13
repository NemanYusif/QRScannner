import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { btoa } from "react-native-quick-base64";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
export default function BarcodeScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState("");
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
  const URL = "https://facecardapi.azurewebsites.net/";

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
    if (!scannedData || !tableNumber) {
      Alert.alert("Xəta", "QR məlumatı və masa nömrəsi daxil edilməlidir.");
      return;
    }
    if (!tableNumber || isNaN(parseInt(tableNumber))) {
      Alert.alert("Xəta", "Masa nömrəsi düzgün daxil edilməyib");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const base64 = btoa(scannedData);
      const tableNo = parseInt(tableNumber, 10);

      const response = await axios.post(
        `${URL}api/qrcodes/scanned?qrData=${base64}&tableNo=${tableNo}`,
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
      setTableNumber("");
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
      <View className="flex-1 w-full justify-center items-center bg-black px-6 py-12">
        {/* Başlıq */}
        <Text className="text-white text-2xl font-bold mb-6 text-center leading-snug">
          {scannedData?.trim()
            ? isURL(scannedData)
              ? "🔗 URL Tapıldı:"
              : "✅ Məlumat Tapıldı:"
            : "⚠️ Məlumat Tapılmadı"}
        </Text>

        <View className="bg-white/10 border border-white/20 rounded-2xl px-4 py-5 mb-8 w-full max-h-[150px]">
          <Text className="text-white text-center text-base leading-relaxed break-words">
            {scannedData || "Heç bir məlumat göstərilmir."}
          </Text>
        </View>

        <Text className="text-white text-lg font-semibold mb-2">
          Masa nömrəsini daxil edin:
        </Text>

        <TextInput
          className="bg-white w-full rounded-xl px-5 py-4 mb-6 text-black text-center text-lg shadow-md"
          value={tableNumber}
          onChangeText={setTableNumber}
          keyboardType="numeric"
          placeholder="Məsələn: 3"
          placeholderTextColor="#999"
        />

        <View className="flex-row flex-wrap justify-center gap-4">
          {isURL(scannedData) && (
            <TouchableOpacity
              onPress={() => Linking.openURL(scannedData)}
              className="bg-green-600 px-6 py-3 rounded-xl shadow-lg"
            >
              <Text className="text-white font-semibold text-base">
                🌐 Sayta Get
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={sendScannedData}
            className="bg-blue-600 px-8  py-3 rounded-xl shadow-lg"
          >
            <Text className="text-white font-semibold text-base">
              📤 Göndər
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setScannedData(null)}
            className="bg-gray-700 px-6 py-3 rounded-xl shadow-lg"
          >
            <Text className="text-white font-semibold text-base">
              ↩️ Geri Qayıt
            </Text>
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
