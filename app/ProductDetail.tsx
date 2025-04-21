import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTFAMILY, FONTSIZE, SPACING } from '../src/theme/theme';
import { RootStackParamList } from '../types/navigation';
import { useStore } from '../src/store/store';

const URL = 'http://192.168.1.150:3000';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Lấy phương thức addToCart từ store tại đây
  const addToCart = useStore((state: any) => state.addToCart);
  
  const [cart, setCart] = useState<any[]>([]); // Giỏ hàng

  const addToCarthandler = (orderItems: any[]) => {
    orderItems.forEach((item) => {
      // Xác định roasted, special_ingredient, type dựa trên ProductType
      const roasted = item.CoffeeRoasted || item.BeansRoasted || "Unknown Roasted";
      const special_ingredient = item.CoffeeSpecialIngredient || item.BeansSpecialIngredient || "No Special Ingredient";
      const type = item.CoffeeType || item.BeansType || "Coffee"; // Giả sử mặc định là "Coffee"
  
      addToCart({
        id: item.ProductID || item.id,
        name: item.ProductName || item.name || "Unnamed Product",
        imagelink_portrait: item.ImageURL || item.CoffeeImageLinkPortrait || item.CoffeeImageLinkSquare || item.BeansImageLinkPortrait || '',
        imagelink_square: item.ImageURL || item.CoffeeImageLinkSquare || item.CoffeeImageLinkPortrait || item.BeansImageLinkPortrait || '',
        prices: [
          {
            size: item.Size || item.prices?.[0]?.size || 'M',
            quantity: item.Quantity || item.prices?.[0]?.quantity || 1,
            price: item.Price?.toString() || item.prices?.[0]?.price?.toString() || '0'
          }
        ],
        roasted: roasted,
        special_ingredient: special_ingredient,
        type: type,
        option: item.option || null,
      });
    });
  
    navigation.navigate("Tab", { screen: "Cart" });
  };
  
  const getUserId = async () => {
    let userId = await AsyncStorage.getItem('user_id');
    return userId || 'guest';
  };

  useEffect(() => {
    const fetchOrderId = async () => {
      try {
        const savedOrderId = await AsyncStorage.getItem('orderId');
        if (savedOrderId) {
          setOrderId(savedOrderId);
        } else {
          console.log('Không tìm thấy OrderID trong AsyncStorage');
        }
      } catch (e) {
        console.error('Lỗi khi lấy OrderID từ AsyncStorage:', e);
      }
    };

    fetchOrderId();
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('Order ID không hợp lệ');
        setLoading(false);
        return;
      }
      const userId = await getUserId();
      try {
        const response = await fetch(`${URL}/api/order-history?orderId=${orderId}&user_id=${userId}`);

        if (!response.ok) {
          throw new Error(`Lỗi HTTP: ${response.status}`);
        }

        const result = await response.json();
        if (result.data) {
          setOrderDetails(result.data);
        } else {
          throw new Error('Không có dữ liệu đơn hàng');
        }
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        setError(err.message || 'Đã xảy ra lỗi khi lấy chi tiết đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const renderCartItem = ({ item }: { item: any }) => {
    // Log dữ liệu item để kiểm tra giá trị
    console.log(item);
  
    const totalProductPrice = (item?.Price ?? 0) * (item?.Quantity ?? 1);
  
    return (
      <View style={styles.cartItem}>
        {item.ImageURL ? (
          <Image
            source={{ uri: item.ImageURL }}
            style={styles.cartImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
    
        <View style={styles.textContainer}>
          <Text style={styles.detail}>
            {item.ProductName} - ${item.Price} x {item.Quantity}
          </Text>
    
          <Text style={styles.sizeText}>Size: {item.Size || 'N/A'}</Text>
    
          <Text style={styles.sizeText}>
            Kiểu: {item.OptionType && item.OptionType !== 'Không có' 
              ? item.OptionType 
              : 'Không có'}
          </Text>
    
          <Text style={styles.totalProductPrice}>
            Total: ${totalProductPrice.toFixed(2)}
          </Text>
        </View>
      </View>
    );
    
  };
  

  if (loading) {
    return <Text style={styles.loadingText}>Đang tải...</Text>;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (!orderDetails) {
    return <Text style={styles.loadingText}>Không tìm thấy chi tiết đơn hàng</Text>;
  }

  return (
    <View style={styles.ScreenContainer}>
      <StatusBar backgroundColor={COLORS.primaryBlackHex} />
      <View style={styles.container}>
        
        {/* Nút Thoát ra ở trên bên trái */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.orderTitle}>Oder detail</Text>
        </View>

        <Text style={styles.detail}>
          Ngày đặt hàng:{' '}
          {orderDetails[0]?.OrderDate
            ? new Date(orderDetails[0].OrderDate).toLocaleDateString()
            : 'Không xác định'}
        </Text>

        <Text style={styles.detail}>
          Tổng tiền:{' '}
          {orderDetails[0]?.TotalAmount
            ? `$${orderDetails[0].TotalAmount.toFixed(2)}`
            : 'Không xác định'}
        </Text>

        <Text style={styles.detail}>Sản phẩm trong đơn hàng:</Text>

        <FlatList
          data={orderDetails}
          renderItem={renderCartItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.cartList}
        />

        <TouchableOpacity
          style={styles.reorderButton}
          onPress={() => {
            addToCarthandler(orderDetails); // Mua lại đơn hàng
          }}
        >
          <Text style={styles.reorderButtonText}>Mua lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};



const styles = StyleSheet.create({
  ScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBlackHex,
  },
  container: {
    flex: 1,
    padding: SPACING.space_16,
  },
  backButton: {
    position: 'absolute',
    left: SPACING.space_16,
    padding: SPACING.space_8,
    backgroundColor: COLORS.primaryDarkGreyHex,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: FONTSIZE.size_20,
    fontFamily: FONTFAMILY.poppins_medium,
    color: COLORS.primaryWhiteHex,
  },
  orderTitle: {
    fontSize: FONTSIZE.size_20,
  fontFamily: FONTFAMILY.poppins_bold,
  color: COLORS.primaryWhiteHex,
  },
  detail: {
    fontSize: FONTSIZE.size_16,
    fontFamily: FONTFAMILY.poppins_medium,
    color: COLORS.primaryWhiteHex,
    marginBottom: 6,
  },
  cartList: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#181C23',
    borderRadius: 8,
    padding: 8,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  cartImage: {
    width: 65,
    height: 65,
    borderRadius: 8,
    marginRight: SPACING.space_10,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.primaryDarkGreyHex,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.space_10,
  },
  placeholderText: {
    fontSize: FONTSIZE.size_16,
    fontFamily: FONTFAMILY.poppins_regular,
    color: COLORS.primaryWhiteHex,
  },
  textContainer: {
    flex: 1,
  },
  sizeText: {
    fontSize: FONTSIZE.size_16,
    fontFamily: FONTFAMILY.poppins_regular,
    color: COLORS.secondaryLightGreyHex,
    marginBottom: 2,
  },
  totalProductPrice: {
    fontSize: FONTSIZE.size_16,
    fontFamily: FONTFAMILY.poppins_regular,
    color: COLORS.primaryOrangeHex,
  },
  loadingText: {
    fontSize: FONTSIZE.size_16,
    color: COLORS.primaryWhiteHex,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: FONTSIZE.size_16,
    color: COLORS.primaryOrangeHex,
    textAlign: 'center',
    marginTop: 20,
  },
  reorderButton: {
    backgroundColor: COLORS.primaryOrangeHex,
    paddingVertical: SPACING.space_12,
    paddingHorizontal: SPACING.space_20,
    borderRadius: 8,
    marginTop: SPACING.space_16,
    alignItems: 'center',
  },
  reorderButtonText: {
    fontSize: FONTSIZE.size_16,
    fontFamily: FONTFAMILY.poppins_medium,
    color: COLORS.primaryWhiteHex,
  },
  headerContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.space_12,
    marginBottom: SPACING.space_12,
  },
 
});

export default ProductDetailScreen;