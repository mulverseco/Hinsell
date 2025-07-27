import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

interface WelcomeScreenProps {
  onLinkQR: () => void;
  onLogin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onLinkQR,
  onLogin,
}) => {
  return (
    <View className="flex-1 bg-white ">
      <View className="flex-1 px-6 justify-between pt-15 pb-10">
        <View className="items-center mt-10">
          <Logo size={120} />
        </View>
        
        <View className="items-center my-10">
          <Text className="text-3xl font-bold text-center mb-3">
            سجل دخولك
          </Text>
          <Text className="text-base text-gray-400 text-center leading-6">
           تطبيق الرقابة
          </Text>
        </View>

        <View className="gap-4">
          <Button
            title="ربط التطبيق"
            onPress={onLinkQR}
            size="large"
            className="w-full"
          />
          
          <Button
            title="تسجيل الدخول"
            onPress={onLogin}
            variant="secondary"
            size="large"
            className="w-full"
          />
          
        </View>
      </View>
    </View>
  );
};