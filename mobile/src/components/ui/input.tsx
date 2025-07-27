import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  className?: string;
  inputClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  isPassword = false,
  style,
  className,
  inputClassName,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getInputContainerClasses = () => {
    let classes = 'flex-row items-center bg-gray-200 rounded-xl border px-4 ';
    
    if (isFocused) {
      classes += 'border-violet-100 ';
    } else if (error) {
      classes += 'border-red-500 ';
    } else {
      classes += 'border-gray-100 ';
    }
    
    return classes;
  };

  return (
    <View className={`mb-4 ${className || ''}`}>
      {label && (
        <Text className="text-sm font-medium mb-2">{label}</Text>
      )}
      <View className={getInputContainerClasses()}>
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        <TextInput
          className={`flex-1 py-4 text-base ${inputClassName || ''}`}
          style={style}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            className="ml-3"
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color="#9CA3AF" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <View className="ml-3">{rightIcon}</View>
        )}
      </View>
      {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
    </View>
  );
};