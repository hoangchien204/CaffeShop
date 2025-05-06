import React, {useCallback, useEffect, useState} from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../../app/IPconfig";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import GradientBGIcon from '../components/GradientBGIcon';
import PaymentMethod from '../components/PaymentMethod';
import PaymentFooter from '../components/PaymentFooter';
import { LinearGradient } from 'expo-linear-gradient';
import CustomIcon from '../components/CustomIcon';
import {useStore} from '../store/store';
import PopUpAnimation from '../components/PopUpAnimation';
import { Image } from 'react-native';
const PaymentList = [
  {
    name: 'Wallet',
    icon: 'icon',
    isIcon: true,
  },
  {
    name: 'Google Pay',
    icon: require('../assets/app_images/gpay.png'),
    isIcon: false,
  },
  {
    name: 'Apple Pay',
    icon: require('../assets/app_images/applepay.png'),
    isIcon: false,
  },
  {
    name: 'Amazon Pay',
    icon: require('../assets/app_images/amazonpay.png'),
    isIcon: false,
  },
];


const PaymentScreen = ({ navigation, route }: any) => {
  // Lấy dữ liệu từ store (chỉ lấy một lần, tránh re-render liên tục)
  const CartPrice = useStore((state) => state.CartPrice);
  const CartList = useStore((state) => state.CartList);
  const addToOrderHistoryListFromCart = useStore((state) => state.addToOrderHistoryListFromCart);
  const calculateCartPrice = useStore((state) => state.calculateCartPrice);

  const [paymentMode, setPaymentMode] = useState('Credit Card');
  const [showAnimation, setShowAnimation] = useState(false);

  const buttonPressHandler = useCallback(async () => {
    setShowAnimation(true);
    // Kiểm tra nếu giỏ hàng rỗng để tránh lỗi API
    if (!CartPrice || CartList.length === 0) {
      setShowAnimation(false);
      return;
    }
    const userId = await AsyncStorage.getItem("user_id");

    if (!userId) {
      setShowAnimation(false);
      Alert.alert("Thông báo","Bạn cần đăng nhập để đặt hàng.",
        [
          {text: "Đăng nhập",onPress: () => navigation.navigate("Login"),},
          {text: "Hủy",style: "cancel",},
        ]
      );
      return;
    }

    const orderData = {
      user_id: userId,
      TotalAmount: CartPrice,
      items: CartList.map((item) => ({
        ProductID: item.id,  // Thêm ID sản phẩm từ CartList
        ProductType: item.type === "Bean" ? "Beans" : item.type,  // Thêm loại sản phẩm (ví dụ 'Coffee' hoặc 'Beans')
        ProductName: item.name,
        Description: item.description || "",
        ImageURL: item.imagelink_portrait || "",
        Size: item.prices[0]?.size || "M",
        Price: parseFloat(item.prices[0]?.price) || 0,
        Quantity: item.prices[0]?.quantity || 1,
        OptionType:  item.prices[0]?.option,
      })),
    };
    console.log("OderData: ", orderData);

    try {
      const response = await fetch(API.createhistory, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const result = await response.json();
    
      // Kiểm tra phản hồi từ API
      if (result.success || result.message?.includes("Đơn hàng đã được tạo")) {
        
        addToOrderHistoryListFromCart(); // Cập nhật lịch sử đơn hàng
        calculateCartPrice(); // Reset giỏ hàng
    
        // Chuyển hướng về trang chính
        setTimeout(() => {
          setShowAnimation(false);
          navigation.reset({ index: 0, routes: [{ name: "Tab" }] });
        }, 2000);
      } else {
        console.error("Lỗi đặt hàng:", result.message || "Không rõ lỗi.");
      }
    } catch (error) {
      console.error("Lỗi kết nối API:", error);
    }
  }, [CartPrice, CartList, navigation, addToOrderHistoryListFromCart, calculateCartPrice]); 
 

  

  return (
    <View style={styles.ScreenContainer}>
      <StatusBar backgroundColor={COLORS.primaryBlackHex} />

      {showAnimation ? (
        <PopUpAnimation
          style={styles.LottieAnimation}
          source={require('../lottie/successful.json')}
        />
      ) : (
        <></>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ScrollViewFlex}>
        <View style={styles.HeaderContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.pop();
            }}>
            <GradientBGIcon
              name="arrow-left"
              color={COLORS.primaryLightGreyHex}
              size={FONTSIZE.size_16}
            />
          </TouchableOpacity>
          <Text style={styles.HeaderText}>Payments</Text>
          <View style={styles.EmptyView} />
        </View>

        <View style={styles.PaymentOptionsContainer}>
          <TouchableOpacity
            onPress={() => {
              setPaymentMode('Credit Card');
            }}>
            <View
              style={[
                styles.CreditCardContainer,
                {
                  borderColor:
                    paymentMode == 'Credit Card'
                      ? COLORS.primaryOrangeHex
                      : COLORS.primaryGreyHex,
                },
              ]}>
              <Text style={styles.CreditCardTitle}>Credit Card</Text>
              <View style={styles.CreditCardBG}>
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.LinearGradientStyle}
                  colors={[COLORS.primaryGreyHex, COLORS.primaryBlackHex]}>
                  <View style={styles.CreditCardRow}>
                  <Image
                      source={require('../assets/coffee_assets/chip.png')}  // Đường dẫn ảnh local
                      style={{
                        width: FONTSIZE.size_20 * 2.359,
                        height: FONTSIZE.size_20 * 2,
                        tintColor: COLORS.primaryOrangeHex, // Nếu ảnh là icon dạng đơn sắc
                      }}
                    />
                    <FontAwesome 
                      name="cc-visa"
                      size={FONTSIZE.size_30 * 2}
                      color={COLORS.primaryWhiteHex}
                    />
                  </View>
                  <View style={styles.CreditCardNumberContainer}>
                    <Text style={styles.CreditCardNumber}>4089</Text>
                    <Text style={styles.CreditCardNumber}>0410</Text>
                    <Text style={styles.CreditCardNumber}>9669</Text>
                    <Text style={styles.CreditCardNumber}>8910</Text>
                  </View>
                  <View style={styles.CreditCardRow}>
                    <View style={styles.CreditCardNameContainer}>
                      <Text style={styles.CreditCardNameSubitle}>
                        Card Holder Name
                      </Text>
                      <Text style={styles.CreditCardNameTitle}>
                        HOANG MINH CHIEN
                      </Text>
                    </View>
                    <View style={styles.CreditCardDateContainer}>
                      <Text style={styles.CreditCardNameSubitle}>
                        Expiry Date
                      </Text>
                      <Text style={styles.CreditCardNameTitle}>02/30</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>
          </TouchableOpacity>
          {PaymentList.map((data: any) => (
            <TouchableOpacity
              key={data.name}
              onPress={() => {
                setPaymentMode(data.name);
              }}>
              <PaymentMethod
                paymentMode={paymentMode}
                name={data.name}
                icon={data.icon}
                isIcon={data.isIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <PaymentFooter
        buttonTitle={`Pay with ${paymentMode}`}
        price={{price: route.params.amount, currency: '$'}}
        buttonPressHandler={buttonPressHandler}
        
      />
    </View>
  );
};

const styles = StyleSheet.create({
  ScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBlackHex,
  },
  LottieAnimation: {
    flex: 1,
  },
  ScrollViewFlex: {
    flexGrow: 1,
  },
  HeaderContainer: {
    paddingHorizontal: SPACING.space_24,
    paddingVertical: SPACING.space_15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  HeaderText: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_20,
    color: COLORS.primaryWhiteHex,
  },
  EmptyView: {
    height: SPACING.space_36,
    width: SPACING.space_36,
  },
  PaymentOptionsContainer: {
    padding: SPACING.space_15,
    gap: SPACING.space_15,
  },
  CreditCardContainer: {
    padding: SPACING.space_10,
    gap: SPACING.space_10,
    borderRadius: BORDERRADIUS.radius_15 * 2,
    borderWidth: 3,
  },
  CreditCardTitle: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_14,
    color: COLORS.primaryWhiteHex,
    marginLeft: SPACING.space_10,
  },
  CreditCardBG: {
    backgroundColor: COLORS.primaryGreyHex,
    borderRadius: BORDERRADIUS.radius_25,
  },
  LinearGradientStyle: {
    borderRadius: BORDERRADIUS.radius_25,
    gap: SPACING.space_36,
    paddingHorizontal: SPACING.space_15,
    paddingVertical: SPACING.space_10,
  },
  CreditCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  CreditCardNumberContainer: {
    flexDirection: 'row',
    gap: SPACING.space_10,
    alignItems: 'center',
  },
  CreditCardNumber: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_16,
    color: COLORS.primaryWhiteHex,
    letterSpacing: SPACING.space_4 + SPACING.space_2,
  },
  CreditCardNameSubitle: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_12,
    color: COLORS.secondaryLightGreyHex,
  },
  CreditCardNameTitle: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_16,
    color: COLORS.primaryWhiteHex,
  },
  CreditCardNameContainer: {
    alignItems: 'flex-start',
  },
  CreditCardDateContainer: {
    alignItems: 'flex-end',
  },
});

export default PaymentScreen;