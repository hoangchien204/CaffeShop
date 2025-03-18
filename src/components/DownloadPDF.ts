
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import * as Print from 'expo-print';
import { Platform } from 'react-native';

export const generateAndDownloadPDF = async (orderHistoryList: any[]) => {
  if (orderHistoryList.length === 0) return;

  // Tạo HTML cho PDF
  let htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Lịch Sử Đặt Hàng</h1>
        <table>
          <tr>
            <th>STT</th>
            <th>Ngày Đặt</th>
            <th>Tên Món</th>
            <th>Giá</th>
          </tr>
  `;

  orderHistoryList.forEach((order, index) => {
    order.CartList.forEach((item: any) => {
      htmlContent += `
        <tr>
          <td>${index + 1}</td>
          <td>${order.OrderDate}</td>
          <td>${item.name}</td>
          <td>${item.price} VND</td>
        </tr>
      `;
    });
  });

  htmlContent += `
        </table>
      </body>
    </html>
  `;

  try {
    // Xuất file PDF
    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    // Đổi tên file để tải về
    const newPath = `${FileSystem.documentDirectory}Order_History.pdf`;
    await FileSystem.moveAsync({ from: uri, to: newPath });

    // Chia sẻ file sau khi tạo
    await shareAsync(newPath);
  } catch (error) {
    console.error('Lỗi khi tạo PDF:', error);
  }
};
