import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, 
  ImageBackground, StyleSheet, Alert 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const SignUpScreen = () => {
  const navigation = useNavigation();
  const navigateTo = (screen: string) => {
    navigation.navigate(screen as never);
  };
  const [showPassword, setShowPassword] = useState(false);

  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Email không hợp lệ", "Vui lòng nhập đúng định dạng email.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Mật khẩu quá ngắn", "Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      const response = await axios.post("http://192.168.1.150:3000/api/register", {
        username,
        email,
        password
      });

      Alert.alert("Đăng ký thành công", response.data.message);
      navigateTo("Login");

    } catch (error) {
      Alert.alert("Lỗi", (error as any).response?.data?.error || "Đăng ký thất bại.");
    }
  };

  return (
    <ImageBackground source={require("../src/assets/backgroun.png")} style={styles.background} >
      <View style={styles.container}>
        <TextInput 
          style={styles.input} 
          placeholder="Name" 
          placeholderTextColor="#555" 
          value={username} 
          onChangeText={setName} 
        />
        
        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          placeholderTextColor="#555" 
          keyboardType="email-address" 
          value={email} 
          onChangeText={setEmail} 
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

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.signupText}>
          Already have an account?{" "}
          <Text style={styles.signupLink} onPress={() => navigateTo("Login")}>Login</Text>
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
  container: {
    width: "80%",
    alignItems: "center",
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
    color: "#FFD700",
  },
});

export default SignUpScreen;
