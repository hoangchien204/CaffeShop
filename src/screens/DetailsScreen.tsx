import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import {useStore} from '../store/store';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import ImageBackgroundInfo from '../components/ImageBackgroundInfo';
import PaymentFooter from '../components/PaymentFooter';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { options } from 'pdfkit';
import API from "../../app/IPconfig";

//lấy user_id
const getUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem("user_id");
    if (userId) {
      return parseInt(userId); // Chuyển đổi về số nếu cần
    }
    return null; // Trả về null nếu không tìm thấy
  } catch (error) {
    console.error("❌ Lỗi khi lấy user_id từ AsyncStorage:", error);
    return null;
  }
};


const DetailsScreen = ({ navigation, route }: any) => {
  const coffeeList = useStore((state: any) => state.CoffeeList);
  const beanList = useStore((state: any) => state.BeanList);
  const addToFavoriteList = useStore((state: any) => state.addToFavoriteList);
  const deleteFromFavoriteList = useStore((state: any) => state.deleteFromFavoriteList);
  const addToCart = useStore((state: any) => state.addToCart);
  const calculateCartPrice = useStore((state: any) => state.calculateCartPrice);

  const type = route.params?.type || 'Coffee'; // Mặc định là Coffee nếu không có type
  const index = route.params?.index; // Lấy index từ params
  const id = route.params?.id; // Lấy id từ params
  const dataList = type === 'Bean' ? beanList : coffeeList;

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<any>(null);
  const [fullDesc, setFullDesc] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]); // Danh sách yêu thích
  const [selectedOption, setSelectedOption] = useState('Nóng');

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ưu tiên lấy index
        if (index !== undefined && dataList.length > 0 && dataList[index]) {
          const foundItem = dataList[index];
          setItem(foundItem);

          // Kiểm tra prices có hợp lệ hay không
          const parsedPrices =
            typeof foundItem.prices === 'string'
              ? JSON.parse(foundItem.prices)
              : Array.isArray(foundItem.prices)
              ? foundItem.prices
              : [];

          setPrice(parsedPrices.length > 0 ? parsedPrices[0] : null);
        }
        // Nếu không có index, thử lấy id
        else if (id !== undefined) {
          const foundItem = dataList.find((item: any) => item.id === id);

          if (foundItem) {
            setItem(foundItem);
            const parsedPrices =
              typeof foundItem.prices === 'string'
                ? JSON.parse(foundItem.prices)
                : Array.isArray(foundItem.prices)
                ? foundItem.prices
                : [];

            setPrice(parsedPrices.length > 0 ? parsedPrices[0] : null);
          } else {
            // Nếu không tìm thấy trong dataList, gọi API để lấy chi tiết sản phẩm
            const response = await fetch(`${API.fetchProductDetails}/${type}/${id}`);
            if (response.ok) {
              const productData = await response.json();
              setItem(productData);

              // Kiểm tra prices có hợp lệ hay không
              const parsedPrices =
                typeof productData.prices === 'string'
                  ? JSON.parse(productData.prices)
                  : Array.isArray(productData.prices)
                  ? productData.prices
                  : [];

              setPrice(parsedPrices.length > 0 ? parsedPrices[0] : null);
            } else {
              throw new Error('Không tìm thấy sản phẩm');
            }
          }
        }
        // Nếu cả index và id đều không có, báo lỗi
        else {
          throw new Error('Dữ liệu không hợp lệ: Thiếu index hoặc id');
        }
      } catch (err: any) {
        console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
        setError(err.message || 'Không thể tải chi tiết sản phẩm. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [dataList, index, id, type]);
  
  if (loading) {
    return (
      <View style={styles.LoadingContainer}>
        <ActivityIndicator size="large" color="blue" />
        <Text style={styles.ErrorText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.LoadingContainer}>
        <Text style={styles.ErrorText}>Không tìm thấy thông tin cho mục này.</Text>
      </View>
    );
  }


  const ToggleFavourite = async (favourite: boolean, type: string, id: string) => {
    try {
      const userId: string = String(await getUserId());
      if (favourite) {
        // Xóa khỏi danh sách yêu thích
        await fetch(`${API.fetchFavorites}?userId=${userId}&productId=${id}`, {
          method: "DELETE",
        });
        setFavorites((prev) => prev.filter((favId) => favId !== id));
        setItem((prevItem: any) => ({
          ...prevItem,
          favourite: false,
        }));
      } else {
        // Thêm vào danh sách yêu thích
        await fetch(API.fetchFavorites, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, productId: id, type }),
        });
        setFavorites((prev) => [...prev, id]);
        setItem((prevItem: any) => ({
          ...prevItem,
          favourite: true,
        }));
      }
    } catch (error) {
      console.error("❌ Lỗi khi thay đổi trạng thái yêu thích:", error);
    }
  };


  

  const BackHandler = () => {
    navigation.pop();
  };

  const addToCarthandler = ({
    id,
    index,
    name,
    roasted,
    imagelink_square,
    imagelink_portrait,
    special_ingredient,
    type,
    price,
  }: any) => {
    addToCart({
      id,
      index,
      name,
      roasted,
      imagelink_square,
      imagelink_portrait,
      special_ingredient,
      type,
      prices: [{ ...price, quantity: 1 }],
    });
    calculateCartPrice();
    navigation.navigate('Tab', { screen: 'Cart' });
  };

  const parsedPrices = item?.prices
  ? typeof item.prices === "string"
    ? JSON.parse(item.prices)
    : item.prices
  : [];
  return (
    
    <View style={styles.ScreenContainer}>
      <StatusBar backgroundColor={COLORS.primaryBlackHex} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ScrollViewFlex}>

      <ImageBackgroundInfo
        EnableBackHandler={true}
        imagelink_portrait={item.imagelink_portrait}
        type={item.type}
        id={item.id}
        favourite={item.favourite}
        name={item.name}
        special_ingredient={item.special_ingredient || ""}
        ingredients={item.ingredients || []}
        average_rating={item.average_rating}
        ratings_count={item.ratings_count}
        roasted={item.roasted || ""}
        BackHandler={BackHandler}
        ToggleFavourite={ToggleFavourite}
      />


        <View style={styles.FooterInfoArea}>
          <Text style={styles.InfoTitle}>Description</Text>
          {fullDesc ? (
            <TouchableWithoutFeedback onPress={() => setFullDesc(prev => !prev)}>
              <Text style={styles.DescriptionText}>{item.description}</Text>
            </TouchableWithoutFeedback>
          ) : (
            <TouchableWithoutFeedback onPress={() => setFullDesc(prev => !prev)}>
              <Text numberOfLines={3} style={styles.DescriptionText}>
                {item.description}
              </Text>
            </TouchableWithoutFeedback>
          )}

          <Text style={styles.InfoTitle}>Size</Text>
          <View style={styles.SizeOuterContainer}>
            {parsedPrices.length > 0 ? (
              parsedPrices.map((data: any) => (
                <TouchableOpacity
                  key={data.size}
                  onPress={() => setPrice(data)}
                  style={[
                    styles.SizeBox,
                    {
                      borderColor:
                        data.size == price.size
                          ? COLORS.primaryOrangeHex
                          : COLORS.primaryDarkGreyHex,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.SizeText,
                      {
                        fontSize:
                          item.type == 'Bean'
                            ? FONTSIZE.size_14
                            : FONTSIZE.size_16,
                        color:
                          data.size == price.size
                            ? COLORS.primaryOrangeHex
                            : COLORS.secondaryLightGreyHex,
                      },
                    ]}>
                    {data.size}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.DescriptionText}>Không có giá</Text>
            )}
          </View>
          {item.type === 'Coffee' && (
  <>
    <Text style={styles.InfoTitle}>Kiểu</Text>
    <View style={styles.SizeOuterContainer}>
      {['Nóng', 'Ít đá', 'Nhiều đá'].map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => setSelectedOption(option)}
          style={[
            styles.SizeBox,
            {
              borderColor:
                selectedOption === option
                  ? COLORS.primaryOrangeHex
                  : COLORS.primaryDarkGreyHex,
            },
          ]}
        >
          <Text
            style={[
              styles.SizeText,
              {
                fontSize: FONTSIZE.size_16,
                color:
                  selectedOption === option
                    ? COLORS.primaryOrangeHex
                    : COLORS.secondaryLightGreyHex,
              },
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </>
)}
        </View>

        <PaymentFooter
          price={price}
          buttonTitle="Add to Cart"
          buttonPressHandler={() => {
            const priceWithOption = {
              ...price,
              option:
        item.type === "Bean"
          ? item.prices[0]?.option || "Không có"
          : selectedOption,
            };
        
            addToCarthandler({
              id: item.id,
              index: index,
              name: item.name,
              roasted: item.roasted,
              imagelink_square: item.imagelink_square,
              imagelink_portrait: item.imagelink_portrait,
              special_ingredient: item.special_ingredient,
              type: item.type,
              price: priceWithOption, 
            });
          }}
        />
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  LoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Có thể đổi theo giao diện của bạn
  },
  ErrorText: {
    marginTop: 10,
    fontSize: 16,
    color: 'red',
  },
  ScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBlackHex,
  },
  ScrollViewFlex: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  FooterInfoArea: {
    padding: SPACING.space_20,
  },
  InfoTitle: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_16,
    color: COLORS.primaryWhiteHex,
    marginBottom: SPACING.space_12,
  },
  DescriptionText: {
    letterSpacing: 0.5,
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.primaryWhiteHex,
    marginBottom: SPACING.space_30,
  },
  SizeOuterContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.space_20,
  },
  SizeBox: {
    flex: 1,
    backgroundColor: COLORS.primaryDarkGreyHex,
    alignItems: 'center',
    justifyContent: 'center',
    height: SPACING.space_24 * 2,
    borderRadius: BORDERRADIUS.radius_10,
    borderWidth: 2,
  },
  SizeText: {
    fontFamily: FONTFAMILY.poppins_medium,
  },
});

export default DetailsScreen;
