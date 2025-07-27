import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
  textClassName?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  className,
  textClassName,
}) => {
  const getButtonClasses = () => {
    let classes = 'rounded-xl items-center justify-center flex-row ';
    
    // Variant styles
    switch (variant) {
      case 'primary':
        classes += 'bg-violet-500 ';
        break;
      case 'secondary':
        classes += 'bg-gray-700 ';
        break;
      case 'outline':
        classes += 'bg-transparent border border-violet-500 ';
        break;
    }
    
    // Size styles
    switch (size) {
      case 'small':
        classes += 'py-2 px-4 ';
        break;
      case 'medium':
        classes += 'py-3 px-6 ';
        break;
      case 'large':
        classes += 'py-4 px-8 ';
        break;
    }
    
    // Disabled state
    if (disabled) {
      classes += 'opacity-50 ';
    }
    
    return classes + (className || '');
  };

  const getTextClasses = () => {
    let classes = 'font-semibold ';
    
    // Variant text styles
    switch (variant) {
      case 'primary':
      case 'secondary':
        classes += 'text-white ';
        break;
      case 'outline':
        classes += 'text-violet-500 ';
        break;
    }
    
    // Size text styles
    switch (size) {
      case 'small':
        classes += 'text-sm ';
        break;
      case 'medium':
        classes += 'text-base ';
        break;
      case 'large':
        classes += 'text-lg ';
        break;
    }
    
    // Disabled text state
    if (disabled) {
      classes += 'opacity-70 ';
    }
    
    return classes + (textClassName || '');
  };

  return (
    <TouchableOpacity
      className={getButtonClasses()}
      style={style}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#8B5CF6'} />
      ) : (
        <Text className={getTextClasses()} style={textStyle}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};