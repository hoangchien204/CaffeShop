import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { router, useRouter } from 'expo-router'; // Đảm bảo import useRouter từ expo-router
import { COLORS, FONTFAMILY, FONTSIZE, SPACING } from '../theme/theme';
import OrderItemCard from './OrderItemCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa kiểu cho props của OrderHistoryCard
interface OrderHistoryCardProps {
  navigationHandler?: any;
  CartList: any[];
  TotalAmount: number;
  OrderDate: string;
  OrderID: string;
  onProductClick?: (item: any) => void;
}

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({
  navigationHandler,
  CartList,
  TotalAmount,
  OrderDate,
  OrderID,
}) => {
  const navigation  = useRouter(); // Khai báo useRouter ở cấp component

  return (
    <View style={styles.CardContainer}>
      <View style={styles.CardHeader}>
        <View>
          <Text style={styles.HeaderTitle}>Order Time</Text>
          <Text style={styles.HeaderSubtitle}>{OrderDate}</Text>
        </View>
        <View style={styles.PriceContainer}>
          <Text style={styles.HeaderTitle}>Total Amount</Text>
          <Text style={styles.HeaderPrice}>
            $ {TotalAmount ? TotalAmount.toFixed(2) : '0.00'}
          </Text>
        </View>
      </View>
      <View style={styles.ListContainer}>
        {Array.isArray(CartList) && CartList.length > 0 ? (
          CartList.map((data: any, index: any) => {
            const totalProductPrice = (data?.Price ?? 0) * (data?.Quantity ?? 1);

            return (
              <TouchableOpacity
                    key={index.toString()}
                    onPress={async () => {
                      // Hàm lưu orderId vào AsyncStorage
                      const saveOrderId = async (orderId: string) => {
                        try {
                          await AsyncStorage.setItem('orderId', orderId.toString());
                        } catch (e) {
                          console.error('Failed to save orderId:', e);
                        }
                      };

                      if (OrderID) {
                        await saveOrderId(OrderID);
                        console.log('OrderID saved to AsyncStorage:', OrderID);
                        navigation.navigate('ProductDetail');
                      } else {
                        console.error('OrderID is not available');
                      }
                    }}
                  >
                <OrderItemCard
                  type={data?.type ?? 'N/A'}
                  name={data?.ProductName ?? 'Không có tên'}
                  imagelink_square={{ uri: data?.ImageURL ?? '' }}
                  special_ingredient={data?.Description ?? ''}
                  prices={data?.prices ?? [{ size: data?.Size ?? '', price: data?.Price ?? 0 }]}
                  ItemPrice={String(data?.Price ?? '0')} // Chuyển thành string để khớp với OrderItemCardProps
                  Quantity={data?.Quantity ?? 1}
                  TotalPrice={totalProductPrice}
                />
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Không có sản phẩm nào</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  CardContainer: {
    gap: SPACING.space_10,
  },
  CardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.space_20,
    alignItems: 'center',
  },
  HeaderTitle: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_8,
    color: COLORS.primaryWhiteHex,
  },
  HeaderSubtitle: {
    fontFamily: FONTFAMILY.poppins_light,
    fontSize: FONTSIZE.size_16,
    color: COLORS.primaryWhiteHex,
  },
  PriceContainer: {
    alignItems: 'flex-end',
  },
  HeaderPrice: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_18,
    color: COLORS.primaryOrangeHex,
  },
  ListContainer: {
    gap: SPACING.space_20,
  },
});

export default OrderHistoryCard;
