import React, { useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {useStore} from '../store/store';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {COLORS, SPACING} from '../theme/theme';
import HeaderBar from '../components/HeaderBar';
import EmptyListAnimation from '../components/EmptyListAnimation';
import PaymentFooter from '../components/PaymentFooter';
import CartItem from '../components/CartItem';

const CartScreen = ({navigation, route}: any) => {
  const CartList = useStore((state: any) => state.CartList);
  const CartPrice = useStore((state: any) => state.CartPrice);
  const userId = "guest";

  const incrementCartItemQuantity = useStore(
    (state: any) => state.incrementCartItemQuantity,
  );
 
  const decrementCartItemQuantity = useStore(
    (state: any) => state.decrementCartItemQuantity,
  );
  const calculateCartPrice = useStore((state: any) => state.calculateCartPrice);
  const tabBarHeight = useBottomTabBarHeight();

  const buttonPressHandler = () => {
    navigation.push('Payment', {amount: CartPrice});
  };

  const incrementCartItemQuantityHandler = (id: string, size: string) => {
    incrementCartItemQuantity(id, size);
    calculateCartPrice();
  };
  

  const decrementCartItemQuantityHandler = (id: string, size: string) => {
    decrementCartItemQuantity(id, size);
    calculateCartPrice();
  };

  console.log('Giỏ hàng:', CartList); // Kiểm tra giỏ hàng

 

  return (
    
    <View style={styles.ScreenContainer}>
      <StatusBar backgroundColor={COLORS.primaryBlackHex} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ScrollViewFlex}>
        <View
          style={[styles.ScrollViewInnerView, {marginBottom: tabBarHeight}]}>
          <View style={styles.ItemContainer}>
            <HeaderBar title="Cart" />
           
            {CartList.length === 0 ? (
  <EmptyListAnimation title={'Cart is Empty'} />
) : (
  <View style={styles.ListItemContainer}>
    {CartList?.map((data: any, index: number) => {
    
    return (
      <TouchableOpacity
        key={`${data.id}-${data.type}-${index}`} // Đảm bảo key không trùng
        onPress={() => {
          navigation.push('Details', {
            index: data.index,
            id: data.id,
            type: data.type,
          });
        }}>
        <CartItem
          id={data.id}
          name={data.name}
          imagelink_portrait={data.imagelink_portrait}
          imagelink_square={data.imagelink_square}
          special_ingredient={data.special_ingredient}
          roasted={data.roasted}
          prices={data.prices}
          type={data.type}
          incrementCartItemQuantityHandler={() =>
            incrementCartItemQuantity(
              data.id,
              data.prices[0].size,
              data.prices[0].option || '' // 👈 Thêm option
            )
          }
          decrementCartItemQuantityHandler={() =>
            decrementCartItemQuantity(
              data.id,
              data.prices[0].size,
              data.prices[0].option || '' // 👈 Thêm option
            )
          }
        />
      </TouchableOpacity>
    );
  })}
              </View>
            )}
          </View>

          {CartList.length != 0 ? (
            <PaymentFooter
            buttonPressHandler={buttonPressHandler}
            buttonTitle="Pay"
            price={{price: CartPrice, currency: '$'}}
          />
          ) : (
            <></>
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
    gap: SPACING.space_20,
  },
});

export default CartScreen;