import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { generateAndDownloadPDF } from '../components/DownloadPDF'; // 🔹 Import hàm tải PDF
import React, { useEffect, useState } from 'react';
import { useStore } from '../store/store';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import HeaderBar from '../components/HeaderBar';
import EmptyListAnimation from '../components/EmptyListAnimation';
import PopUpAnimation from '../components/PopUpAnimation';
import OrderHistoryCard from '../components/OrderHistoryCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderHistoryScreen = ({ navigation }: any) => {
  const tabBarHeight = useBottomTabBarHeight();

  const OrderHistoryList = useStore((state: any) => state.OrderHistoryList);
  const setOrderHistoryList = useStore((state: any) => state.setOrderHistoryList);

  const [loading, setLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const getUserId = async () => {
    let userId = await AsyncStorage.getItem("user_id");
    return userId || "guest";
  };

  const fetchOrderHistory = async () => {
    try {
      const userId = await getUserId();
      const response = await fetch(`http://192.168.1.150:3000/api/orders?user_id=${userId}`);
      const data = await response.json();

      if (Array.isArray(data?.data) && data.data.length > 0) {
        const sortedData = data.data.sort(
          (a: { OrderDate: string; OrderID: number }, b: { OrderDate: string; OrderID: number }) =>
            new Date(b.OrderDate).getTime() - new Date(a.OrderDate).getTime() || b.OrderID - a.OrderID
        );
        setOrderHistoryList(sortedData);
      } else {
        setOrderHistoryList([]);
        console.warn("❗ Dữ liệu trả về không đúng định dạng hoặc không có đơn hàng!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách đơn hàng:", error);
      setOrderHistoryList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const navigationHandler = ({ index, id, type }: { index: number; id: string; type: string }) => {
    navigation.push('Details', {
      index,
      id,
      type,
    });
  };

  const handleProductClick = (item: any) => {
    setSelectedItem(item);
    navigation.push('ProductDetail', { product: item }); // Điều hướng tới màn hình chi tiết sản phẩm
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const buttonPressHandler = async () => {
    setShowAnimation(true);
    await generateAndDownloadPDF(OrderHistoryList);
    setTimeout(() => {
      setShowAnimation(false);
    }, 2000);
  };

  return (
    <View style={styles.ScreenContainer}>
      <StatusBar backgroundColor={COLORS.primaryBlackHex} />

      {showAnimation ? (
        <PopUpAnimation
          style={styles.LottieAnimation}
          source={require('../lottie/download.json')}
        />
      ) : (
        <></>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ScrollViewFlex}>
        <View style={[styles.ScrollViewInnerView, { marginBottom: tabBarHeight }]}>
          <View style={styles.ItemContainer}>
            <HeaderBar title="Order History" />

            {OrderHistoryList.length === 0 ? (
              <EmptyListAnimation title={'No Order History'} />
            ) : (
              <View style={styles.ListItemContainer}>
                {Array.isArray(OrderHistoryList) ? (
                  OrderHistoryList.length > 0 ? (
                    OrderHistoryList.map((data: any, index: number) => {
                      // Hiển thị sản phẩm đầu tiên nếu có nhiều hơn 1 sản phẩm
                      const displayItems = data?.items && Array.isArray(data.items)
                        ? data.items.slice(0, 1) // Chỉ lấy sản phẩm đầu tiên
                        : [];
                      return (
                        <OrderHistoryCard
                          key={index.toString()}
                          navigationHandler={navigationHandler}
                          CartList={displayItems}
                          TotalAmount={parseFloat(data?.TotalAmount) || 0}
                          OrderDate={data?.OrderDate ?? "N/A"}
                          onProductClick={handleProductClick} // Truyền hàm xử lý sự kiện bấm vào sản phẩm
                          OrderID={data?.OrderID ?? ''}                       />
                      );
                    })
                  ) : (
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>Không có đơn hàng nào</Text>
                  )
                ) : (
                  <Text style={{ textAlign: 'center', marginTop: 20 }}>Đang tải...</Text>
                )}
              </View>
            )}
          </View>

          {OrderHistoryList.length > 0 && (
            <TouchableOpacity
              style={styles.DownloadButton}
              onPress={buttonPressHandler}>
              <Text style={styles.ButtonText}>Download</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  ScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBlackHex,
  },
  LottieAnimation: {
    height: 250,
  },
  ScrollViewFlex: {
    flexGrow: 1,
  },
  ScrollViewInnerView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  ItemContainer: {
    flex: 1,
  },
  ListItemContainer: {
    paddingHorizontal: SPACING.space_20,
    gap: SPACING.space_30,
  },
  DownloadButton: {
    margin: SPACING.space_20,
    backgroundColor: COLORS.primaryOrangeHex,
    alignItems: 'center',
    justifyContent: 'center',
    height: SPACING.space_36 * 2,
    borderRadius: BORDERRADIUS.radius_20,
  },
  ButtonText: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_18,
    color: COLORS.primaryWhiteHex,
  },
});

export default OrderHistoryScreen;
