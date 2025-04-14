import { options } from 'pdfkit';
import {create} from 'zustand';
import {produce} from 'immer';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CoffeeData from '../data/CoffeeData';
import BeansData from '../data/BeansData';



// Gọi hàm xóa dữ liệu


export interface CoffeeItem {
  id: string;
  name: string;
  description: string;
  roasted: string;
  imagelink_square: string;
  imagelink_portrait: string;
  ingredients: string;
  special_ingredient: string;
  prices: { size: string; price: string; currency: string; quantity?: number; option?: string | null}[];
  average_rating: number;
  ratings_count: string;
  favourite: boolean;
  type: string;
  index: number;
  
}

interface OrderHistoryItem {
  OrderDate: string;
  CartList: CartItem[];
  CartListPrice: string;
}
// Định nghĩa kiểu cho trạng thái và các phương thức của store
interface CoffeeStore {
  CoffeeList: CoffeeItem[];
  BeanList: CoffeeItem[];
  CartPrice: string;
  FavoritesList: CoffeeItem[];
  CartList: CoffeeItem[];
  OrderHistoryList: OrderHistoryItem[];

  fetchCoffeeList: () => Promise<void>;
  fetchBeansList: () => Promise<void>;
  addToCart: (cartItem: CoffeeItem) => void;
  calculateCartPrice: () => void;
  addToFavoriteList: (type: string, id: string) => void;
  deleteFromFavoriteList: (type: string, id: string) => void;
  incrementCartItemQuantity: (id: string, size: string, option: string) => void;
  decrementCartItemQuantity: (id: string, size: string,option: string) => void;

  addToOrderHistoryListFromCart: () => void;
  setOrderHistoryList: (orders: any[]) => void;
}
interface CoffeeCardProps {
  id: string;
  index: number;
  name: string;
  roasted: string;
  imagelink_square: string;
  special_ingredient: string;
  type: string;
  prices: { size: string; price: string; currency: string; quantity?: number }[];
  average_rating?: number;
  price?: string;
  buttonPressHandler?: () => void;
}
interface Price {
  size: string;
  price: string; // price là string trong dữ liệu
  currency: string;
  quantity?: number; // quantity là tùy chọn
  option?: string;
}

// Định nghĩa kiểu cho CartItem
interface CartItem {
  id: string;
  name: string;
  description: string;
  roasted: string;
  imagelink_square: string;
  imagelink_portrait: string;
  ingredients: string;
  special_ingredient: string;
  prices: Price[];
  average_rating: number;
  ratings_count: string;
  favourite: boolean;
  type: string;
  index: number;
}

// Định nghĩa kiểu cho OrderItem (dữ liệu gửi lên API)
interface OrderItem {
  ProductName: string;
  Description: string;
  ImageURL: string;
  Size: string;
  Price: number;
  Quantity: number;
}

interface StoreOrder {
  OrderID: number;
  OrderDate: string;
  TotalAmount: number;
  username: string;
  items: OrderItem[];
}

// Định nghĩa kiểu cho navigation và route
interface OrderHistoryScreenProps {
  navigation: any; // Có thể thay bằng kiểu cụ thể từ React Navigation
}
// Định nghĩa kiểu cho state của useStore
interface StoreState {
  CartPrice: string; // CartPrice là string trong store
  CartList: CartItem[];
  addToOrderHistoryListFromCart: () => void;
  calculateCartPrice: () => void;
}



const clearUnnecessaryData = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Lỗi khi xóa dữ liệu:", error);
  }
};

clearUnnecessaryData();
// clearUnnecessaryData()

// Gọi hàm này thay vì clear toàn bộ
interface OrderHistoryState {
  OrderHistoryList: any[];
  setOrderHistoryList: (orders: any[]) => void;
}
export const useStore = create<CoffeeStore>()(
  
  persist(
    (set, get) => ({
      CoffeeList: [],
      BeanList: [],
      CartPrice: '0',
      FavoritesList: [],
      CartList: [],
      OrderHistoryList: [],
      CartItems: [],

      setOrderHistoryList: (orders) => set({ OrderHistoryList: orders }),
      fetchCoffeeList: async () => {
        try {
          const response = await fetch('http://192.168.1.150:3000/api/get-coffees');
          const result = await response.json();
          if (result.data) {
            // Chuẩn hóa dữ liệu từ API
            const normalizedData = result.data.map((item: any) => {
              // Parse chuỗi JSON của prices thành mảng
              let parsedPrices: { size: string; price: string; currency: string }[] = [];
              try {
                parsedPrices = typeof item.prices === 'string' ? JSON.parse(item.prices) : item.prices;
              } catch (error) {
                console.error('Error parsing prices for item:', item.id, error);
                parsedPrices = [{ size: 'M', price: '0.00', currency: 'USD' }]; // Giá trị mặc định nếu parse thất bại
              }
      
              return {
                id: String(item.id),
                name: item.name || 'Unknown Coffee',
                description: item.description || '',
                roasted: item.roasted || 'Unknown',
                imagelink_square: item.imagelink_square || '',
                imagelink_portrait: item.imagelink_portrait || '',
                ingredients: item.ingredients || '',
                special_ingredient: item.special_ingredient || 'None',
                prices: parsedPrices,
                average_rating: item.average_rating || 0,
                ratings_count: String(item.ratings_count || '0'),
                favourite: item.favourite || false,
                type: item.type || 'Coffee',
                index: item.index_position || 0, // Ánh xạ index_position thành index
              };
            });
      
            set({ CoffeeList: normalizedData });
          } else {
            console.error('API Error: No data found');
          }
        } catch (error) {
          console.error('Error fetching coffee list:', error);
        }
      },
      fetchBeansList: async () => {
        try {
          const response = await fetch('http://192.168.1.150:3000/api/get-beans');
          const result = await response.json();
      
    
      
          if (result.data) {
            const normalizedData = result.data.map((item: any) => {
              let parsedPrices: { size: string; price: string; currency: string }[] = [];
              try {
                parsedPrices = typeof item.prices === 'string' ? JSON.parse(item.prices) : item.prices;
              } catch (error) {
                console.error('Error parsing prices for item:', item.id, error);
                parsedPrices = [{ size: 'M', price: '0.00', currency: 'USD' }];
              }
      
              return {
                id: String(item.id),
                name: item.name || 'Unknown Bean',
                description: item.description || '',
                roasted: item.roasted || 'Unknown',
                imagelink_square: item.imagelink_square || '',
                imagelink_portrait: item.imagelink_portrait || '',
                ingredients: item.ingredients || '',
                special_ingredient: item.special_ingredient || 'None',
                prices: parsedPrices,
                average_rating: item.average_rating || 0,
                ratings_count: String(item.ratings_count || '0'),
                favourite: item.favourite || false,
                type: item.type || 'Bean',
                index: item.index_position || 0,
              };
            });
      
            set({ BeanList: normalizedData });
          } else {
            console.error('API Error: No data found');
          }
        } catch (error) {
          console.error('Error fetching beans list:', error);
        }
      },
      
      addToCart: (cartItem: any, index?: number) =>
        set(
          produce(state => {
            if (!cartItem || !cartItem.id || !cartItem.prices || !cartItem.prices[0]) {
              console.error('❌ Lỗi: cartItem không hợp lệ:', cartItem);
              return;
            }
            const itemIndex = state.CartList.findIndex(
              (item: { id: string; prices: any[] }) =>
                item.id === cartItem.id &&
                item.prices[0].size.toUpperCase() === cartItem.prices[0].size.toUpperCase() &&
                (item.prices[0].option ?? '').toUpperCase() === (cartItem.prices[0].option ?? '').toUpperCase()
            );

            if (itemIndex !== -1) {
              const item = state.CartList[itemIndex];
              item.prices[0].quantity =
                (item.prices[0].quantity || 0) + (cartItem.prices[0].quantity || 1);
            } else {
              state.CartList.push({
                ...cartItem,
                prices: [{ ...cartItem.prices[0], quantity: cartItem.prices[0].quantity || 1 }],
              });
            }

            const totalPrice = state.CartList.reduce((total: number, item: { prices: any[] }) => {
              const itemTotal = item.prices.reduce((subTotal: number, price: any) => {
                const priceValue = parseFloat(price.price) || 0;
                const quantity = price.quantity || 0;
                return subTotal + priceValue * quantity;
              }, 0);
              return total + itemTotal;
            }, 0);
            state.CartPrice = totalPrice.toFixed(2);
        
          })
        ),

        calculateCartPrice: () =>
          set(state => {
            const totalPrice = state.CartList.reduce((total, item) => {
              const itemTotal = item.prices.reduce((subTotal, price) => {
                const priceValue = parseFloat(price.price) || 0;
                const quantity = price.quantity || 0; // Đảm bảo quantity không undefined
        
                return subTotal + priceValue * quantity; // Cộng hoặc trừ tương ứng với quantity
              }, 0);
              return total + itemTotal;
            }, 0);
        
            return { CartPrice: totalPrice.toFixed(2) };
          }),
        
          addToFavoriteList: (type: string, id: string) =>
            set(
              produce((state) => {
                if (type === 'Coffee') {
                  for (let i = 0; i < state.CoffeeList.length; i++) {
                    if (state.CoffeeList[i].id === id) {
                      if (!state.CoffeeList[i].favourite) {
                        state.CoffeeList[i].favourite = true;
                        state.FavoritesList.unshift(state.CoffeeList[i]);
                      } else {
                        state.CoffeeList[i].favourite = false;
                      }
                      break;
                    }
                  }
                } else if (type === 'Bean') {
                  for (let i = 0; i < state.BeanList.length; i++) {
                    if (state.BeanList[i].id === id) {
                      if (!state.BeanList[i].favourite) {
                        state.BeanList[i].favourite = true;
                        state.FavoritesList.unshift(state.BeanList[i]);
                      } else {
                        state.BeanList[i].favourite = false;
                      }
                      break;
                    }
                  }
                }
              }),
            ),
          deleteFromFavoriteList: (type: string, id: string) =>
            set(
              produce((state) => {
                if (type === 'Coffee') {
                  for (let i = 0; i < state.CoffeeList.length; i++) {
                    if (state.CoffeeList[i].id === id) {
                      if (state.CoffeeList[i].favourite) {
                        state.CoffeeList[i].favourite = false;
                      }
                      break;
                    }
                  }
                } else if (type === 'Beans') { // Sửa 'Beans' thành 'Bean' nếu cần
                  for (let i = 0; i < state.BeanList.length; i++) {
                    if (state.BeanList[i].id === id) {
                      if (state.BeanList[i].favourite) {
                        state.BeanList[i].favourite = false;
                      }
                      break;
                    }
                  }
                }
                let spliceIndex = -1;
                for (let i = 0; i < state.FavoritesList.length; i++) {
                  if (state.FavoritesList[i].id === id) {
                    spliceIndex = i;
                    break;
                  }
                }
                if (spliceIndex !== -1) {
                  state.FavoritesList.splice(spliceIndex, 1);
                }
              }),
            ),
          setFavoritesList: (favorites: any[]) =>
            set(
              produce((state) => {
                state.FavoritesList = favorites;
                // Đồng bộ trạng thái favourite trong CoffeeList và BeanList
                favorites.forEach((fav) => {
                  if (fav.type === 'Coffee') {
                    const coffee = state.CoffeeList.find((item: any) => item.id === fav.id);
                    if (coffee) coffee.favourite = true;
                  } else if (fav.type === 'Bean') {
                    const bean = state.BeanList.find((item: any) => item.id === fav.id);
                    if (bean) bean.favourite = true;
                  }
                });
              }),
            ),
            incrementCartItemQuantity: (id: string, size: string, option: string) =>
              set(
                produce(state => {
                  try {
                    const cartListLength = state.CartList.length;
                  } catch (error) {
                    console.error('❌ CartList Proxy bị revoked:', error);
                    state.CartList = [];
                    return;
                  }
            
                  const item = state.CartList.find(
                    (cartItem: { id: string; prices: any[] }) =>
                      cartItem.id === id &&
                      cartItem.prices.some(
                        price =>
                          price.size.toUpperCase() === size.toUpperCase() &&
                          price.option?.toUpperCase() === option.toUpperCase()
                      )
                  );
            
                  if (!item) {
                    console.error('❌ Không tìm thấy CartItem với id, size và option:', { id, size, option });
                    return;
                  }
            
                  const price = item.prices.find(
                    p =>
                      p.size.toUpperCase() === size.toUpperCase() &&
                      p.option?.toUpperCase() === option.toUpperCase()
                  );
            
                  if (!price) {
                    console.error('❌ Không tìm thấy price với size và option:', { size, option });
                    return;
                  }
            
                  price.quantity = (price.quantity || 0) + 1;
            
                  const totalPrice = state.CartList.reduce((total: number, item: { prices: any[] }) => {
                    const itemTotal = item.prices.reduce((subTotal: number, price: any) => {
                      const priceValue = parseFloat(price.price) || 0;
                      const quantity = price.quantity || 0;
                      return subTotal + priceValue * quantity;
                    }, 0);
                    return total + itemTotal;
                  }, 0);
                  state.CartPrice = totalPrice.toFixed(2);
                })
              ),
            
            decrementCartItemQuantity: (id: string, size: string, option: string) =>
              set(
                produce(state => {
                  for (let i = 0; i < state.CartList.length; i++) {
                    if (state.CartList[i].id === id) {
                      if (!Array.isArray(state.CartList[i].prices)) {
                        state.CartList[i].prices = Object.values(state.CartList[i].prices || {});
                      }
            
                      for (let j = 0; j < state.CartList[i].prices.length; j++) {
                        if (
                          state.CartList[i].prices[j].size.toUpperCase() === size.toUpperCase() &&
                          state.CartList[i].prices[j].option?.toUpperCase() === option.toUpperCase()
                        ) {
                          if (state.CartList[i].prices.length > 1) {
                            if (state.CartList[i].prices[j].quantity > 1) {
                              state.CartList[i].prices[j].quantity--;
                            } else {
                              state.CartList[i].prices.splice(j, 1);
                            }
                          } else {
                            if (state.CartList[i].prices[j].quantity > 1) {
                              state.CartList[i].prices[j].quantity--;
                            } else {
                              state.CartList.splice(i, 1);
                            }
                          }
            
                          // 🔹 Tính lại tổng giá sau khi giảm số lượng
                          const totalPrice = state.CartList.reduce((total: number, item: { prices: any[] }) => {
                            const itemTotal = item.prices.reduce((subTotal: number, price: any) => {
                              const priceValue = parseFloat(price.price) || 0;
                              const quantity = price.quantity || 0;
                              return subTotal + priceValue * quantity;
                            }, 0);
                            return total + itemTotal;
                          }, 0);
            
                          state.CartPrice = totalPrice.toFixed(2);
            
                          return;
                        }
                      }
                    }
                  }
                })
              ),
      addToOrderHistoryListFromCart: () =>
        set(
          produce(state => {
            let temp = state.CartList.reduce(
              (accumulator: number, currentValue: any) =>
                accumulator + parseFloat(currentValue.ItemPrice),
              0,
            );
            if (state.OrderHistoryList.length > 0) {
              state.OrderHistoryList.unshift({
                OrderDate:
                  new Date().toDateString() +
                  ' ' +
                  new Date().toLocaleTimeString(),
                CartList: state.CartList,
                CartListPrice: temp.toFixed(2).toString(),
              });
            } else {
              state.OrderHistoryList.push({
                OrderDate:
                  new Date().toDateString() +
                  ' ' +
                  new Date().toLocaleTimeString(),
                CartList: state.CartList,
                CartListPrice: temp.toFixed(2).toString(),
              });
            }
            state.CartList = [];
          }),
        ),
    }),
    {
      name: 'coffee-app',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
  
);

function calculateCartPrice(state: any) {
  throw new Error('Function not implemented.');
}