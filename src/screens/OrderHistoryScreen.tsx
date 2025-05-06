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
import API from "../../app/IPconfig";
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

  const fetchOrderHistory = async (page = 1, limit = 5) => {
    try {
      setLoading(true);  // Đảm bảo rằng trạng thái loading được bật lên khi bắt đầu fetch
  
      const userId = await getUserId();
      const response = await fetch(`${API.fetchOrderHistory}?user_id=${userId}&page=${page}&limit=${limit}`);
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
      setLoading(false);  // Đảm bảo rằng trạng thái loading được tắt khi hoàn thành
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
  const [page, setPage] = useState(1);

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };
  
  useEffect(() => {
    fetchOrderHistory(page);  // Gọi API mỗi khi page thay đổi
  }, [page]);
  
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
      contentContainerStyle={styles.ScrollViewFlex}
      onScroll={({ nativeEvent }) => {
        const { contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom = contentOffset.y >= contentSize.height - 1 - contentOffset.height;
        if (isCloseToBottom && !loading) {
          handleLoadMore();  // Tải thêm khi cuộn đến cuối
        }
      }}
      scrollEventThrottle={400}  // Điều chỉnh tốc độ phản hồi sự kiện cuộn
    >
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
                    const displayItems = data?.items && Array.isArray(data.items) ? data.items.slice(0, 1) : [];
                    return (
                      <OrderHistoryCard
                        key={index.toString()}
                        navigationHandler={navigationHandler}
                        CartList={displayItems}
                        TotalAmount={parseFloat(data?.TotalAmount) || 0}
                        OrderDate={data?.OrderDate ?? "N/A"}
                        onProductClick={handleProductClick}
                        OrderID={data?.OrderID ?? ''}
                      />
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

        {OrderHistoryList.length > 0 && !loading && (
          <TouchableOpacity
            style={styles.DownloadButton}
            onPress={buttonPressHandler}
          >
            <Text style={styles.ButtonText}>Download</Text>
          </TouchableOpacity>
        )}

        {/* Hiển thị nút tải thêm nếu còn dữ liệu */}
        {loading && <Text style={{ textAlign: 'center', marginTop: 20 }}>Đang tải thêm...</Text>}
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
