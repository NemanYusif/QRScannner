import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const [login, setName] = useState("");
  const [password, setPassword] = useState("");
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
    if (!login || !password) {
      Alert.alert("Xəta", "Zəhmət olmasa bütün sahələri doldurun");
      return;
    }

    try {
      const response = await axios.post(`${baseURL}api/employees/login`, {
        login,
        password,
      });

      await AsyncStorage.setItem("token", JSON.stringify(response.data));

      Alert.alert("Uğur!", `Xoş gəldiniz, ${login}`);
      router.replace("/BarcodeScanner");
    } catch (error) {
      Alert.alert("Xəta", "Giriş zamanı problem baş verdi");
      console.error(error);
    }
  };

  return (
    <View className="flex-1 w-full gap-3 justify-center items-center bg-black px-4">
      <Text className="text-white text-2xl font-bold mb-6">Daxil ol</Text>

      <TextInput
        className="bg-white w-full rounded-lg px-4 py-6"
        placeholder="Istifadəçi adı"
        value={login}
        onChangeText={setName}
        autoCapitalize="none"
      />

      <TextInput
        className="bg-white w-full rounded-lg px-4 py-6 mb-6"
        placeholder="Şifrə"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        onPress={handleLogin}
        className="bg-blue-600 px-16 py-4 rounded-xl"
      >
        <Text className="text-white font-bold text-lg">Giriş et</Text>
      </TouchableOpacity>
    </View>
  );
}
