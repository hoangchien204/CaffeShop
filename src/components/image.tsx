import { Image } from 'react-native';
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
const ImageComponent = ({ type }: { type: string }) => {
  return (
    <Image
      source={type === 'Bean' 
        ? require('../assets/images/coffee_assets/coffeeBean.png') 
        : require('../assets/images/coffee_assets/coffeeBeans.png')
      }
      style={{
        width: type === 'Bean' ? 18 : 24,
        height: type === 'Bean' ? 18 : 24,
        tintColor: COLORS.primaryOrangeHex, // Nếu cần đổi màu
      }}
      resizeMode="contain"
    />
  );
};
