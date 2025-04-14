import React, {useRef,useEffect, useState} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ToastAndroid,
} from 'react-native';
import {useStore, CoffeeItem} from '../store/store';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import HeaderBar from '../components/HeaderBar';
import CustomIcon from '../components/CustomIcon';
import {FlatList} from 'react-native';
import CoffeeCard from '../components/CoffeeCard';
import {Dimensions} from 'react-native';
import axios from 'axios';

const getCategoriesFromData = (data: any) => {
  let temp: any = {};
  for (let i = 0; i < data.length; i++) {
    if (temp[data[i].name] == undefined) {
      temp[data[i].name] = 1;
    } else {
      temp[data[i].name]++;
    }
  }
  let categories = Object.keys(temp);
  categories.unshift('All');
  return categories;
};

const getCoffeeList = (category: string, data: any) => {
  if (category == 'All') {
    return data;
  } else {
    let coffeelist = data.filter((item: any) => item.name == category);
    return coffeelist;
  }
};
const getBeansList = (category: string, list: any[]) => {
  if (category === "All") return list; // Nếu chọn "All", trả về toàn bộ danh sách
  return list.filter(item => item.type === category);
};
interface CoffeeCardProps {
  id: string;
  index: number;
  name: string;
  roasted: string;
  imagelink_square: string;
  imagelink_portrait: string;
  special_ingredient: string;
  type: string;
  prices: { size: string; price: string; currency: string; quantity?: number,option: string }[];
  average_rating?: number;
  price?: string;
  buttonPressHandler?: () => void;
  ratings_count?: string;  // 👈 Thêm thuộc tính này
}

const HomeScreen = ({navigation}: any) => {
  
  const CoffeeList = useStore((state: any) => state.CoffeeList);
  const fetchCoffeeList = useStore((state: any) => state.fetchCoffeeList);
  const BeanList = useStore((state: any) => state.BeanList);
  const fetchBeansList = useStore((state: any) => state.fetchBeansList);
  const addToCart = useStore((state: any) => state.addToCart);
  const calculateCartPrice = useStore((state: any) => state.calculateCartPrice);
  
  const [categories, setCategories] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [categoryIndex, setCategoryIndex] = useState({
    index: 0,
    category: 'All',
  });
  const [beansCategory, setBeansCategory] = useState({
    index: 0,
    category: 'All',
  });
  const [sortedCoffee, setSortedCoffee] = useState<any[]>([]);

  // 🛠 Gọi API khi component mount
  useEffect(() => {
    fetchCoffeeList();
  }, []);

  // 🔄 Cập nhật categories khi CoffeeList thay đổi
  useEffect(() => {
    setCategories(getCategoriesFromData(CoffeeList));
  }, [CoffeeList]);

 
  useEffect(() => {
    setSortedCoffee(getCoffeeList(categoryIndex.category, CoffeeList));
  }, [categoryIndex, CoffeeList]);

  const [sortedBeans, setSortedBeans] = useState<any[]>([]);

// 🛠 Gọi API khi component mount
    useEffect(() => {
      fetchBeansList();
    }, []);

// 🔄 Cập nhật danh sách Beans khi BeanList thay đổi
useEffect(() => {
  setSortedBeans(getBeansList(beansCategory.category, BeanList));
}, [beansCategory, BeanList]);


  const ListRef: any = useRef<FlatList>();
  const tabBarHeight = useBottomTabBarHeight();

  const searchCoffee = (search: string) => {
    if (search != '') {
      ListRef?.current?.scrollToOffset({
        animated: true,
        offset: 0,
      });
      setCategoryIndex({index: 0, category: categories[0]});
      setSortedCoffee([
        ...CoffeeList.filter((item: any) =>
          item.name.toLowerCase().includes(search.toLowerCase()),
        ),
      ]);
    }
  };

  const resetSearchCoffee = () => {
    ListRef?.current?.scrollToOffset({
      animated: true,
      offset: 0,
    });
    setCategoryIndex({index: 0, category: categories[0]});
    setSortedCoffee([...CoffeeList]);
    setSearchText('');
  };

  const handleAddToCart = (
    item: CoffeeCardProps,
    selectedSize: string,
    selectedOption: string
  ) => {
    console.log("✅ item.prices:", item.prices);
console.log("🔎 selectedSize:", selectedSize, "selectedOption:", selectedOption);
    const addToCart = useStore.getState().addToCart;
    const calculateCartPrice = useStore.getState().calculateCartPrice;
  
    if (!item.prices || !Array.isArray(item.prices) || item.prices.length === 0) {
      console.error("❌ Lỗi: Prices không hợp lệ!", item.prices);
      return;
    }
  const isCoffee = item.type.toLowerCase() === "coffee";
  const isBean = item.type.toLowerCase() === "bean";
 
const validPrice = item.prices.find((p) => {
  if (isCoffee) {
    return (
      p.size === selectedSize &&
      (p.option === selectedOption || !p.option || selectedOption === "Không có")
    );
  } else {
    return p.size === selectedSize;
  }
});
  
  if (!validPrice) {
    console.error("🚨 Không tìm thấy giá phù hợp! selectedSize:", selectedSize, "selectedOption:", selectedOption);
    console.log("📦 Danh sách prices:", item.prices);
    return;
  }

    const cartItem: CoffeeItem = {
      id: item.id,
      name: item.name,
      description: "Không có mô tả",
      roasted: item.roasted,
      imagelink_square: item.imagelink_square,
      imagelink_portrait: item.imagelink_portrait,
      ingredients: "",
      special_ingredient: item.special_ingredient,
      prices: [
        {
          ...validPrice,
          quantity: 1,
          ...(isCoffee ? { option: 'Nóng' } : {option: 'Không có'}) // 👉 chỉ thêm nếu là coffee
        }
      ],
      average_rating: item.average_rating || 0,
      ratings_count: item.ratings_count || "0",
      favourite: false,
      type: item.type,
      index: item.index,
    };
  
    addToCart(cartItem);
    calculateCartPrice();
    ToastAndroid.showWithGravity(
      `${item.name} đã thêm vào giỏ hàng`,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER
    );
  };

  return (
    <View style={styles.ScreenContainer}>
      <StatusBar backgroundColor={COLORS.primaryBlackHex} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ScrollViewFlex}>
        {/* App Header */}
        <HeaderBar />


        {/* Search Input */}

        <View style={styles.InputContainerComponent}>
          <TouchableOpacity
            onPress={() => {
              searchCoffee(searchText);
            }}>
            <CustomIcon
              style={styles.InputIcon}
              name="magnify"
              size={FONTSIZE.size_18}
              color={
                searchText.length > 0
                  ? COLORS.primaryOrangeHex
                  : COLORS.primaryLightGreyHex
              }
            />
          </TouchableOpacity>
          <TextInput
            placeholder="Find Your Coffee..."
            value={searchText}
            onChangeText={text => {
              setSearchText(text);
              searchCoffee(text);
            }}
            placeholderTextColor={COLORS.primaryLightGreyHex}
            style={styles.TextInputContainer}
          />
          {searchText.length > 0 ? (
            <TouchableOpacity
              onPress={() => {
                resetSearchCoffee();
              }}>
              <CustomIcon
                style={styles.InputIcon}
                name="close"
                size={FONTSIZE.size_16}
                color={COLORS.primaryLightGreyHex}
              />
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </View>

        {/* Category Scroller */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.CategoryScrollViewStyle}>
          {categories.map((data, index) => (
            <View
              key={index.toString()}
              style={styles.CategoryScrollViewContainer}>
              <TouchableOpacity
                style={styles.CategoryScrollViewItem}
                onPress={() => {
                  ListRef?.current?.scrollToOffset({
                    animated: true,
                    offset: 0,
                  });
                  setCategoryIndex({index: index, category: categories[index]});
                  setSortedCoffee([
                    ...getCoffeeList(categories[index], CoffeeList),
                  ]);
                }}>
                <Text
                  style={[
                    styles.CategoryText,
                    categoryIndex.index == index
                      ? {color: COLORS.primaryOrangeHex}
                      : {},
                  ]}>
                  {data}
                </Text>
                {categoryIndex.index == index ? (
                  <View style={styles.ActiveCategory} />
                ) : (
                  <></>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Coffee Flatlist */}

        {sortedCoffee.length === 0 ? (
  <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading coffee data...</Text>
) : (
        <FlatList
        ref={ListRef}
        horizontal
        ListEmptyComponent={
          <View style={styles.EmptyListContainer}>
            <Text style={styles.CategoryText}>No Coffee Available</Text>
          </View>
        }
        
        showsHorizontalScrollIndicator={false}
        data={sortedCoffee}
        contentContainerStyle={styles.FlatListContainer}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => { // Lấy index từ renderItem
          if (!item || !item.prices) {
            console.error("Lỗi: item hoặc prices bị undefined!", item);
            return null;
          }

          let pricesArray = [];
          if (item.prices) {
            try {
              pricesArray = typeof item.prices === "string" ? JSON.parse(item.prices) : item.prices;
         
            } catch (error) {
              console.error("❌ Lỗi parse JSON:", error);
            }
          }
          const priceValue = pricesArray.length > 0 && pricesArray[0]?.price !== undefined
            ? `${pricesArray[0].currency}${pricesArray[0].price}`
            : "N/A";
          return (
            <TouchableOpacity
            onPress={() => {
                navigation.push("Details", {
                index, // Dùng index từ FlatList
                id: item.id,
                type: item.type,
              });
            }}
            >
              <CoffeeCard
                id={item.id}
                index={index}
                type={item.type}
                roasted={item.roasted}
                imagelink_square={item.imagelink_square}
                name={item.name}
                special_ingredient={item.special_ingredient}
                average_rating={item.average_rating}
                price={priceValue}
                buttonPressHandler={() => {
                  const defaultSize = item.prices[0].size;
                  const defaultOption = item.type.toLowerCase() === 'coffee' ? 'Nóng' : 'Không có';
                  handleAddToCart(item, defaultSize, defaultOption);
                }}
                
              />
              
              
            </TouchableOpacity>
            
          );
          
        }}  
      />

    )}


        <Text style={styles.CoffeeBeansTitle}>Coffee Beans</Text>

        {/* Beans Flatlist */}
        <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={sortedBeans} // Đổi BeanList thành sortedBeans
        contentContainerStyle={[
          styles.FlatListContainer,
          { marginBottom: tabBarHeight },
        ]}
        keyExtractor={(item) => item.id}
        renderItem={({ item,index }) => {
          if (!item || !item.prices) {
            console.error("Lỗi: item hoặc prices bị undefined!", item);
            return null;
          }

          let pricesArray = [];
          if (item.prices) {
            try {
              pricesArray = typeof item.prices === "string" ? JSON.parse(item.prices) : item.prices;
         
            } catch (error) {
              console.error("❌ Lỗi parse JSON:", error);
            }
          }
          const priceValue = pricesArray.length > 0 && pricesArray[0]?.price !== undefined
            ? `${pricesArray[0].currency}${pricesArray[0].price}`
            : "N/A";
          return (
            <TouchableOpacity
              onPress={() => {
                navigation.push('Details', {
                  index, // Dùng index từ FlatList
                id: item.id,
                type: item.type,
                });
              }}>
              <CoffeeCard
                 id={item.id}
                 index={index}
                 type={item.type}
                 roasted={item.roasted}
                 imagelink_square={item.imagelink_square}
                 name={item.name}
                 special_ingredient={item.special_ingredient}
                 average_rating={item.average_rating}
                 price={priceValue}
                 buttonPressHandler={() => {
                  const defaultSize = item.prices[0].size;
                  const defaultOption = item.type.toLowerCase() === 'coffee' ? 'Nóng' : 'Không có';
                  handleAddToCart(item, defaultSize, defaultOption);
                }}
              />
            </TouchableOpacity>
          );
            }}
    />

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
  ScreenTitle: {
    fontSize: FONTSIZE.size_28,
    fontFamily: FONTFAMILY.poppins_semibold,
    color: COLORS.primaryWhiteHex,
    paddingLeft: SPACING.space_30,
  },
  InputContainerComponent: {
    flexDirection: 'row',
    margin: SPACING.space_30,
    borderRadius: BORDERRADIUS.radius_20,
    backgroundColor: COLORS.primaryDarkGreyHex,
    alignItems: 'center',
  },
  InputIcon: {
    marginHorizontal: SPACING.space_20,
  },
  TextInputContainer: {
    flex: 1,
    height: SPACING.space_20 * 3,
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_14,
    color: COLORS.primaryWhiteHex,
  },
  CategoryScrollViewStyle: {
    paddingHorizontal: SPACING.space_20,
    marginBottom: SPACING.space_20,
  },
  CategoryScrollViewContainer: {
    paddingHorizontal: SPACING.space_15,
  },
  CategoryScrollViewItem: {
    alignItems: 'center',
  },
  CategoryText: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_16,
    color: COLORS.primaryLightGreyHex,
    marginBottom: SPACING.space_4,
  },
  ActiveCategory: {
    height: SPACING.space_10,
    width: SPACING.space_10,
    borderRadius: BORDERRADIUS.radius_10,
    backgroundColor: COLORS.primaryOrangeHex,
  },
  FlatListContainer: {
    gap: SPACING.space_20,
    paddingVertical: SPACING.space_20,
    paddingHorizontal: SPACING.space_30,
  },
  EmptyListContainer: {
    width: Dimensions.get('window').width - SPACING.space_30 * 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.space_36 * 3.6,
  },
  CoffeeBeansTitle: {
    fontSize: FONTSIZE.size_18,
    marginLeft: SPACING.space_30,
    marginTop: SPACING.space_20,
    fontFamily: FONTFAMILY.poppins_medium,
    color: COLORS.secondaryLightGreyHex,
  },
});



export default HomeScreen;