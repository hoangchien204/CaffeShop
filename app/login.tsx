import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, Image, Alert, Platform, ToastAndroid } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Import navigation
import { StackNavigationProp } from "@react-navigation/stack";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { Ionicons } from "@expo/vector-icons";

// Định nghĩa kiểu cho các màn hình
type RootStackParamList = {
  Tab: { screen: keyof TabParamList };
};

type TabParamList = {
  Home: undefined;
  Cart: undefined;
};

// Khai báo kiểu navigation
type NavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList, "Tab">,
  BottomTabNavigationProp<TabParamList>
>;


const showAlert = (title: string, message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    setTimeout(() => Alert.alert(title, message), 100);
  }
};
const LoginScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigateTo = (screen: string) => {
    navigation.navigate(screen as never);
  };
  const showAlert = (title: string, message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    setTimeout(() => Alert.alert(title, message), 100);
  }
};

const handleLogin = async () => {
  if (!username || !password) {
    showAlert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  try {
    const response = await fetch("http://192.168.1.150:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    await AsyncStorage.setItem("user_id", data.user_id.toString());
  

    
    if (!response.ok) {
      showAlert("Lỗi", data.error || "Đăng nhập thất bại!");
      return;
    }

    showAlert("Thành công", "Đăng nhập thành công!");
    navigation.navigate("Tab", { screen: "Home" });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    showAlert("Lỗi", "Không thể kết nối đến máy chủ!");
  }
};

  return (
    <ImageBackground source={require("../src/assets/backgroun.png")} style={styles.background}>
      <View style={styles.header}>
    <Text style={styles.title}>Coffee so good, your taste buds will love it</Text>
  </View>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#555"
          value={username}
          onChangeText={setUsername}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#555"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#555"
            />
          </TouchableOpacity>
        </View>


        {/* <TouchableOpacity>
          <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <Text style={styles.signupText}>
          Chưa có tài khoản?{" "}
          <Text style={styles.signupLink} onPress={() => navigateTo("SignUp")}>
            Đăng ký
          </Text>
        </Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  header: {
    width: "100%",
    paddingTop: 60,
    marginBottom: 20,
    alignItems: "center", // căn giữa ngang
  },
  title: {
    fontSize: 30,
    fontFamily: "DancingScript", // dùng font đã load
    color: "#fff",
    marginBottom: 40,
    marginTop: 60,
    textAlign: "center",
    alignSelf: "center",
  },
  container: {
    width: "80%",
    alignItems: "center",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  forgotPassword: {
    color: "#fff",
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  signupText: {
    color: "#fff",
  },
  signupLink: {
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: "#FFD700", // Màu vàng nổi bật hơn
  },
});

export default LoginScreen;
