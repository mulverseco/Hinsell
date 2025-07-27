import React from 'react';
import { View, Image, Text, ViewStyle, ImageStyle, TextStyle } from 'react-native';

type AvatarProps = {
    size?: number;
    uri?: string;
    name?: string;
    style?: ViewStyle;
};

const getInitials = (name?: string) => {
    if (!name) return '';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export const Avatar = ({ size = 48, uri, name, style } : AvatarProps ) => {
    const containerStyle: ViewStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#9CA3AF',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style,
    };

    const textStyle: TextStyle = {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: size / 2,
    };

    const imageStyle: ImageStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
    };

    return (
        <View className='flex-row items-center justify-start gap-2'>
          <View style={containerStyle}>
              {uri ? (
                  <Image
                      source={{ uri }}
                      style={imageStyle}
                      resizeMode="cover"
                  />
              ) : (
                  <Text style={textStyle}>
                      {getInitials(name)}
                  </Text>
              )}
          </View>
          <Text className='text-center font-bold text-xl'>{name}</Text>
        </View>
    );
};
