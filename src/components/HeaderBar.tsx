import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackActions, useNavigation } from "@react-navigation/native";
import { COLORS, FONTFAMILY, FONTSIZE, SPACING } from "../theme/theme";
import GradientBGIcon from "./GradientBGIcon";
import ProfilePic from "./ProfilePic";
import * as Animatable from "react-native-animatable";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Updates from "expo-updates";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

interface HeaderBarProps {
  title?: string;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ title }) => {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userId = await AsyncStorage.getItem("user_id");
      setIsLoggedIn(!!userId);
    };

    checkLoginStatus();
  }, []);




  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible);
  };

  const navigateTo = (screen: string) => {
    setMenuVisible(false);
    navigation.navigate(screen as never);
  };

  const handleLogout = async () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        onPress: async () => {
          await AsyncStorage.removeItem("user_id");
          setIsLoggedIn(false);
          Alert.alert("Thành công", "Bạn đã đăng xuất!");
  
          // Làm mới ứng dụng
          await Updates.reloadAsync();
        },
      },
    ]);
  };

  return (
    <>
      <View style={styles.HeaderContainer}>
        <TouchableOpacity onPress={toggleMenu}>
          <GradientBGIcon
            name="menu"
            color={COLORS.primaryLightGreyHex}
            size={FONTSIZE.size_16}
          />
        </TouchableOpacity>

        <Text style={styles.HeaderText}>{title}</Text>
        <ProfilePic />
      </View>

      <Modal transparent={true} visible={isMenuVisible} animationType="fade">
        <Pressable style={styles.overlay} onPress={toggleMenu}>
          <Animatable.View
            animation="slideInLeft"
            duration={300}
            style={styles.menuContainer}
          >
            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("Home")}>
              <Icon name="home" size={24} color="#fff" />
              <Text style={styles.menuText}>Trang chủ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("Cart")}>
              <Icon name="cart" size={24} color="#fff" />
              <Text style={styles.menuText}>Giỏ hàng</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("Favorite")}>
              <Icon name="heart" size={24} color="#fff" />
              <Text style={styles.menuText}>Yêu thích</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("History")}>
              <Icon name="history" size={24} color="#fff" />
              <Text style={styles.menuText}>Lịch sử</Text>
            </TouchableOpacity>

            {/* 🔥 Nếu chưa đăng nhập, hiển thị "Đăng nhập" */}
            {!isLoggedIn ? (
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("Login")}>
                <Icon name="login" size={24} color="#fff" />
                <Text style={styles.menuText}>Đăng nhập</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Icon name="logout" size={24} color="#fff" />
                <Text style={styles.menuText}>Đăng xuất</Text>
              </TouchableOpacity>
            )}
          </Animatable.View>
        </Pressable>
      </Modal>
    </>
  );
};


const styles = StyleSheet.create({
  HeaderContainer: {
    padding: SPACING.space_30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  HeaderText: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_20,
    color: COLORS.primaryWhiteHex,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_HEIGHT,
    backgroundColor: "#000",
    paddingVertical: 20,
    paddingLeft: 20,
    shadowColor: "#fff",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  menuText: {
    marginLeft: 15,
    fontSize: 18,
    color: COLORS.primaryWhiteHex,
    fontFamily: FONTFAMILY.poppins_medium,
  },
});

export default HeaderBar;
