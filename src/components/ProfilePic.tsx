import React, { useEffect, useState } from 'react';
import {StyleSheet, Image, View} from 'react-native';
import {COLORS, SPACING} from '../theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfilePic = () => {
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const loadOrGenerateAvatar = async () => {
      try {
        let seed = await AsyncStorage.getItem('user_avatar_seed');

        if (!seed) {
          seed = Math.random().toString(36).substring(7);
          await AsyncStorage.setItem('user_avatar_seed', seed);
        }

        const url = `https://api.dicebear.com/7.x/adventurer/png?seed=${seed}`;
        setAvatarUrl(url);
      } catch (error) {
        console.error('Lỗi khi lấy avatar:', error);
      }
    };

    loadOrGenerateAvatar();
  }, []);

  return (
    <View style={styles.ImageContainer}>
      {avatarUrl !== '' && (
        <Image
          source={{ uri: avatarUrl }}
          style={styles.Image}
        />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  ImageContainer: {
    height: SPACING.space_36,
    width: SPACING.space_36,
    borderRadius: SPACING.space_12,
    borderWidth: 2,
    borderColor: COLORS.secondaryDarkGreyHex,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  Image: {
    height: SPACING.space_36,
    width: SPACING.space_36,
  },
});

export default ProfilePic;
