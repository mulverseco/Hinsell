import React from 'react';
import { Text, View, ViewStyle } from 'react-native';

interface LogoProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 80,
  style,
  className,
}) => {
  return (
    <View 
      className={`items-center justify-center ${className || ''}`}
      style={[{ width: size, height: size }, style]}
    >
      <Text className='text-4xl text-black'>Pharsy</Text>
    </View>
  );
};