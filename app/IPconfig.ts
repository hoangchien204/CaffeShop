const URL_LINK = "http://http://192.168.1.7:3000:3000";

const API = {
    LOGIN: `${URL_LINK}/api/login`,
    SIGNUP: `${URL_LINK}/api/register`,
    ProductDetail:`${URL_LINK}/api/order-history`,
    fetchFavorites: `${URL_LINK}/api/favorites`,
    fetchProductDetails: `${URL_LINK}/api/products`,
    fetchOrderHistory: `${URL_LINK}/api/orders`,
    fetchCoffeeList: `${URL_LINK}/api/get-coffees`,
    fetchBeansList: `${URL_LINK}/api/get-beans`,
    createhistory : `${URL_LINK}/api/create-history`,

}
export default API;