import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [UserName, setName] = useState("");
  const [Password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const router = useRouter();

  const baseURL = "https://facecardapi.azurewebsites.net/";

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        router.replace("/BarcodeScanner");
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    if (!UserName || !Password) {
      Alert.alert("Xəta", "Zəhmət olmasa bütün sahələri doldurun");
      return;
    }

    try {
      const response = await axios.post(`${baseURL}api/employees/login`, {
        UserName,
        Password,
      });

      const token = response.data?.data?.accessToken;

      if (!token) {
        Alert.alert("Xəta", "Token serverdən gəlmədi.");
        return;
      }

      await AsyncStorage.setItem("token", token);

      const THIRTY_DAYS_MS = 20 * 60 * 1000;

      setTimeout(async () => {
        await AsyncStorage.removeItem("token");
        router.replace("/LoginScreen");
        Alert.alert("Sessiya müddəti bitdi", "Yenidən Giriş edin.");
      }, THIRTY_DAYS_MS);

      Alert.alert("Uğur!", `Xoş gəldiniz, ${UserName}`);
      router.replace("/BarcodeScanner");
    } catch (error) {
      Alert.alert("Xəta", "Giriş zamanı problem baş verdi");
    }
  };

  return (
    <View className="flex-1 w-full gap-3 justify-center items-center bg-black px-4">
      <Image
        className="w-[30%] h-[15%]"
        source={require("../assets/images/QRLoqo.png")}
      />
      <Text className="text-white text-3xl font-bold mb-6">Daxil ol</Text>

      <TextInput
        className="bg-white w-full text-[#000] rounded-lg px-4 py-6"
        placeholder="Istifadəçi adı"
        value={UserName}
        onChangeText={setName}
        autoCapitalize="none"
      />

      {/* Şifrə sahəsi + ikon */}
      <View className="w-full bg-white rounded-lg px-4 flex-row items-center mb-6">
        <TextInput
          className="flex-1 py-6 text-[#000]"
          placeholder="Şifrə"
          value={Password}
          onChangeText={setPassword}
          secureTextEntry={secure}
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Ionicons name={secure ? "eye-off" : "eye"} size={24} color="#888" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        className="bg-blue-600 px-16 py-4 rounded-xl"
      >
        <Text className="text-white font-bold text-lg">Giriş et</Text>
      </TouchableOpacity>
    </View>
  );
}
