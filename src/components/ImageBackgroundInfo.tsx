import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageProps,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';

import GradientBGIcon from './GradientBGIcon';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import CustomIcon from './CustomIcon';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';



interface ImageBackgroundInfoProps {
  EnableBackHandler: boolean;
  imagelink_portrait: string;
  type: string;
  id: string;
  favourite: boolean;
  name: string;
  special_ingredient: string;
  ingredients: string;
  average_rating: number;
  ratings_count: string;
  roasted: string;
  BackHandler?: any;
  ToggleFavourite: any;
}


const ImageBackgroundInfo: React.FC<ImageBackgroundInfoProps> = ({
  EnableBackHandler,
  imagelink_portrait,
  type,
  id,
  favourite,
  name,
  special_ingredient,
  ingredients,
  average_rating,
  ratings_count,
  roasted,
  BackHandler,
  ToggleFavourite,
}) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false); 
  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("user_id");
        if (storedUserId) {
          setUserId(String(storedUserId).trim());
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy user_id từ AsyncStorage:", error);
      }
    };
  
    getUserId();
  }, []);
  
  
  // Lấy danh sách yêu thích từ API
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`http://192.168.1.150:3000/api/favorites?userId=${userId}`);
        const data = await response.json();
        const favoriteIds = data.favorites.map((item: any) => item.id); // Lấy danh sách ID từ server
        setFavorites(favoriteIds);
        setIsFavorite(favoriteIds.includes(id)); // Kiểm tra sản phẩm hiện tại có trong danh sách không
      } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu thích:", error);
      }
    };
    if (userId) fetchFavorites(); 
  }, [userId, id]);
  
  // Kiểm tra xem sản phẩm hiện tại có được yêu thích hay không
  const handleToggleFavourite = async () => {
    try {
      if (isFavorite) {
        // Nếu đang yêu thích, gửi yêu cầu xóa
        const response = await fetch(
          `http://192.168.1.150:3000/api/favorites?userId=${userId}&productId=${id}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        const result = await response.json();
        if (result.message) {
          setIsFavorite(false); // Cập nhật giao diện
          setFavorites(favorites.filter(favId => favId !== id)); // Cập nhật danh sách local
          console.log(result.message);
        }
      } else {
        // Nếu chưa yêu thích, gửi yêu cầu thêm
        const response = await fetch('http://192.168.1.150:3000/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            productId: id,
          }),
        });
        const result = await response.json();
        if (result.message) {
          setIsFavorite(true); // Cập nhật giao diện
          setFavorites([...favorites, id]); // Cập nhật danh sách local
          console.log(result.message);
        }
      }
    } catch (error) {
      console.error('❌ Lỗi khi thay đổi trạng thái yêu thích:', error);
    }
  };
  
  
  return (
    <View>
      <ImageBackground
        source={{ uri: imagelink_portrait }}
        style={styles.ItemBackgroundImage}>
        {EnableBackHandler ? (
          <View style={styles.ImageHeaderBarContainerWithBack}>
            <TouchableOpacity onPress={BackHandler}>
              <GradientBGIcon
                name="arrow-left"
                color={COLORS.primaryLightGreyHex}
                size={FONTSIZE.size_16}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleToggleFavourite}>
              <GradientBGIcon
                name="heart"
                color={isFavorite ? COLORS.primaryRedHex : COLORS.primaryLightGreyHex}
                size={FONTSIZE.size_16}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ImageHeaderBarContainerWithoutBack}>
            <TouchableOpacity onPress={handleToggleFavourite}>
              <GradientBGIcon
                name="heart"
                color={isFavorite ? COLORS.primaryRedHex : COLORS.primaryLightGreyHex}
                size={FONTSIZE.size_16}
              />
            </TouchableOpacity>
          </View>
        )}
    

        <View style={styles.ImageInfoOuterContainer}>
          <View style={styles.ImageInfoInnerContainer}>
            <View style={styles.InfoContainerRow}>
              <View>
                <Text style={styles.ItemTitleText}>{name}</Text>
                <Text style={styles.ItemSubtitleText}>
                  {special_ingredient}
                </Text>
              </View>
              <View style={styles.ItemPropertiesContainer}>
                <View style={styles.ProperFirst}>  
                  <Image
                    source={type === 'Bean' 
                      ? require('../assets/coffee_assets/coffee-bean.png') 
                      : require('../assets/coffee_assets/coffee-beans.png')
                    }
                    style={{
                      width: type === 'Bean' ? FONTSIZE.size_18 : FONTSIZE.size_24,
                      height: type === 'Bean' ? FONTSIZE.size_18 : FONTSIZE.size_24,
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.PropertyTextFirst,
                      {
                        marginTop:
                          type == 'Bean'
                            ? SPACING.space_4 + SPACING.space_2
                            : 0,
                      },
                    ]}>
                    {type}
                  </Text>
                </View>
                <View style={styles.ProperFirst}>
                <Image
                    source={type === 'Bean' 
                      ? require('../assets/coffee_assets/Africa.png') 
                      : require('../assets/coffee_assets/milk.png')
                    }
                    style={{
                      width: type === 'Bean' ? FONTSIZE.size_18 : FONTSIZE.size_24,
                      height: type === 'Bean' ? FONTSIZE.size_18 : FONTSIZE.size_24,
                    }}
                    resizeMode="contain"
                  />
                  <Text style={styles.PropertyTextLast}>{ingredients}</Text>
                </View>
              </View>
            </View>
            <View style={styles.InfoContainerRow}>
              <View style={styles.RatingContainer}>
                <CustomIcon
                  name={'star'}
                  color={COLORS.primaryOrangeHex}
                  size={FONTSIZE.size_20}
                />
                <Text style={styles.RatingText}>{average_rating}</Text>
                <Text style={styles.RatingCountText}>({ratings_count})</Text>
              </View>
              <View style={styles.RoastedContainer}>
                <Text style={styles.RoastedText}>{roasted}</Text>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  ItemBackgroundImage: {
    width: '100%',
    aspectRatio: 20 / 25,
    justifyContent: 'space-between',
  },
  ImageHeaderBarContainerWithBack: {
    padding: SPACING.space_30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ImageHeaderBarContainerWithoutBack: {
    padding: SPACING.space_30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  ImageInfoOuterContainer: {
    paddingVertical: SPACING.space_24,
    paddingHorizontal: SPACING.space_30,
    backgroundColor: COLORS.primaryBlackRGBA,
    borderTopLeftRadius: BORDERRADIUS.radius_20 * 2,
    borderTopRightRadius: BORDERRADIUS.radius_20 * 2,
  },
  ImageInfoInnerContainer: {
    justifyContent: 'space-between',
    gap: SPACING.space_15,
  },
  InfoContainerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ItemTitleText: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_24,
    color: COLORS.primaryWhiteHex,
  },
  ItemSubtitleText: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_12,
    color: COLORS.primaryWhiteHex,
  },
  ItemPropertiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.space_20,
  },
  ProperFirst: {
    height: 55,
    width: 55,
    borderRadius: BORDERRADIUS.radius_15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBlackHex,
  },
  PropertyTextFirst: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_10,
    color: COLORS.primaryWhiteHex,
  },
  PropertyTextLast: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_10,
    color: COLORS.primaryWhiteHex,
    marginTop: SPACING.space_2 + SPACING.space_4,
  },
  RatingContainer: {
    flexDirection: 'row',
    gap: SPACING.space_10,
    alignItems: 'center',
  },
  RatingText: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_18,
    color: COLORS.primaryWhiteHex,
  },
  RatingCountText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_12,
    color: COLORS.primaryWhiteHex,
  },
  RoastedContainer: {
    height: 55,
    width: 55 * 2 + SPACING.space_20,
    borderRadius: BORDERRADIUS.radius_15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBlackHex,
  },
  RoastedText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_10,
    color: COLORS.primaryWhiteHex,
  },
});

export default ImageBackgroundInfo;
