import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useStore } from '../store/store';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { COLORS, SPACING } from '../theme/theme';
import HeaderBar from '../components/HeaderBar';
import EmptyListAnimation from '../components/EmptyListAnimation';
import FavoritesItemCard from '../components/FavoritesItemCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import API from "../../app/IPconfig";
const getUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem("user_id");
    if (userId) {
      return String(userId).trim();
    }
    return null;
  } catch (error) {
    console.error("❌ Lỗi khi lấy user_id từ AsyncStorage:", error);
    return null;
  }
};

const FavoritesScreen = ({ navigation }: any) => {
  const FavoritesList = useStore((state: any) => state.FavoritesList);
  const setFavoritesList = useStore((state: any) => state.setFavoritesList); // Thêm action để set toàn bộ danh sách
  const addToFavoriteList = useStore((state: any) => state.addToFavoriteList);
  const deleteFromFavoriteList = useStore((state: any) => state.deleteFromFavoriteList);
  const tabBarHeight = useBottomTabBarHeight();
  const [isLoading, setIsLoading] = useState(true); // Thêm state để kiểm tra trạng thái tải dữ liệu

  // Hàm lấy danh sách yêu thích
const fetchFavorites = async () => {
  try {
    setIsLoading(true); // Bắt đầu tải
    const userId = await getUserId();
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const response = await fetch(`${API.fetchFavorites}?userId=${userId}`);
    if (response.ok) {
      const data = await response.json();
      console.log("Dữ liệu từ API:", data);

      const favorites = data.favorites || [];
      if (Array.isArray(favorites)) {
        setFavoritesList(favorites); // Cập nhật danh sách yêu thích vào store
      } else {
        console.error("❌ Dữ liệu yêu thích không hợp lệ");
      }
    } else {
      console.error("❌ Lỗi khi lấy danh sách yêu thích từ API");
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách yêu thích:", error);
  } finally {
    setIsLoading(false); // Hoàn tất tải
  }
};
    useFocusEffect(
      React.useCallback(() => {
        fetchFavorites(); // Gọi lại API mỗi khi màn hình focus
      }, [])
    );


  // Lấy danh sách yêu thích từ API khi mở màn hình
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const userId = await getUserId();
        if (!userId) {
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(`${API.fetchFavorites}?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
       

          const favorites = data.favorites || [];
          if (Array.isArray(favorites)) {
            // Cập nhật toàn bộ danh sách yêu thích vào store
            setFavoritesList(favorites); // Sử dụng action setFavoritesList thay vì add từng item
          } else {
            console.error("❌ Dữ liệu yêu thích không hợp lệ");
          }
        } else {
          console.error("❌ Lỗi khi lấy danh sách yêu thích từ API");
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách yêu thích:", error);
      } finally {
        setIsLoading(false); // Đánh dấu đã tải xong dữ liệu
      }
    };

    fetchFavorites();
  }, [setFavoritesList]);

  const ToggleFavourite = async (favourite: boolean, type: string, id: string) => {
    try {
      const userId = await getUserId();
      if (!userId) {
        console.error("❌ Không tìm thấy userId!");
        return;
      }
  
      if (favourite) {
        // Xóa khỏi danh sách yêu thích
        const response = await fetch(`${API.fetchFavorites}?userId=${userId}&productId=${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          // Xóa sản phẩm khỏi danh sách yêu thích trong store
          deleteFromFavoriteList(type, id);
          console.log(`Sản phẩm với ID ${id} đã được xóa khỏi danh sách yêu thích`);
        } else {
          console.error("❌ Lỗi khi xóa sản phẩm khỏi danh sách yêu thích");
        }
      } else {
        // Thêm vào danh sách yêu thích
        const response = await fetch(API.fetchFavorites, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, productId: id }),
        });
        const result = await response.json();
        if (response.ok) {
          // Thêm sản phẩm vào danh sách yêu thích trong store
          const product = FavoritesList.find((item: any) => item.id === id) || { id, type: [type], favourite: true };
          addToFavoriteList(product);
          console.log(`Sản phẩm với ID ${id} đã được thêm vào danh sách yêu thích`);
        } else {
          console.error("❌ Lỗi khi thêm sản phẩm vào danh sách yêu thích");
        }
      }
  
      // Làm mới danh sách yêu thích sau khi thêm hoặc xóa
      await fetchFavorites();  // Đảm bảo gọi API lại và làm mới danh sách yêu thích
    } catch (error) {
      console.error("❌ Lỗi khi thay đổi trạng thái yêu thích:", error);
    }
  };
  

  return (
    <View style={styles.ScreenContainer}>
      <StatusBar backgroundColor={COLORS.primaryBlackHex} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ScrollViewFlex}>
        <View style={[styles.ScrollViewInnerView, { marginBottom: tabBarHeight }]}>
          <View style={styles.ItemContainer}>
            <HeaderBar title="Favourites" />
            {FavoritesList.length === 0 ? (
              <EmptyListAnimation title={'No Favourites'} />
            ) : (
              <View style={styles.ListItemContainer}>
                {FavoritesList.map((data: any) => (
                  <TouchableOpacity
                  onPress={() => {
               
                    navigation.push('Details', {
                      id: data.id,  // Truyền id của sản phẩm
                      type: data.type?.[0] || 'Unknown',  // Truyền type của sản phẩm
                    });
                  }}
                  key={data.id}
                >
                  <FavoritesItemCard
                    id={data.id || 'N/A'}
                    imagelink_portrait={data.imagelink_square || ''}
                    name={data.name || 'Không có tên'}
                    special_ingredient={data.special_ingredient || 'Không có'}
                    type={data.type?.[0] || 'Unknown'}
                    ingredients={data.ingredients || 'Không có nguyên liệu'}
                    average_rating={data.average_rating || 0}
                    ratings_count={data.ratings_count?.toString() || '0'}
                    roasted={data.roasted || 'Không rõ'}
                    description={data.description || 'Không có mô tả'}
                    favourite={true}
                    ToggleFavouriteItem={ToggleFavourite}
                  />
                </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
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

export default FavoritesScreen;