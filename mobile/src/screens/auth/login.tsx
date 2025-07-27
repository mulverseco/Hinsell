import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Input } from '@/components/ui/input';
import { LogIn } from 'lucide-react-native';
import { useAuth } from '@/core/hooks/use-auth';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
const {login,isAuthLoading} = useAuth()

const handleLogin = async () => {
  try {
   await login( username, password );
    
  } catch (err: any) {
    console.error('Login failed:', err);
    Alert.alert(
      `Login failed ${process.env.REACT_NATIVE_PUBLIC_BACKEND_API_URL || ""}`, 
      err?.data?.message || err?.error || 'An unknown error occurred'
    );
  }
};

  return (
    <View className="flex-1 p-4 justify-center bg-white">
      <View className="rounded-2xl overflow-hidden shadow-sm">  
        <View className="px-4 py-2">
          <View className="flex-row items-center rounded-lg">
            <Input
              className="flex-1 p-0 ml-2"
              label='Username'
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType={"default"}
            />
          </View>
        </View>

        <View className="px-4 py-2">
          <View className="flex-row items-center rounded-lg">
            <Input
              className="flex-1 p-0 ml-2"
              label='Password'
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              isPassword
            />
          </View>
        </View>

        <View className="px-4 py-2">
          <TouchableOpacity>
            <Text className="text-sm text-violet-500 text-right">Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <View className="px-4 py-3">
          <TouchableOpacity
            className={`p-3 rounded-lg flex-row justify-center items-center ${isAuthLoading ? 'bg-violet-400' : 'bg-violet-600'}`}
            onPress={handleLogin}
            disabled={isAuthLoading}
            activeOpacity={0.7}
          >
            {isAuthLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <LogIn size={18} color="white" className="mr-2" />
                <Text className="text-white font-bold ml-2">Sign In</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View className="px-4 py-3">
          <Text className="text-sm text-gray-500 text-center">
            Don't have an account? <Text className="text-violet-500 font-medium">Sign Up</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

Login.Skeleton = () => {
  const renderDottedLine = () => {
    return (
      <View className="flex-row items-center my-3">
        <View className="flex-1 h-[1px] bg-gray-200" />
        {Array.from({ length: 15 }).map((_, index) => (
          <View key={index} className="w-1 h-1 rounded-full bg-gray-300 mx-[2px]" />
        ))}
        <View className="flex-1 h-[1px] bg-gray-200" />
      </View>
    );
  };

  return (
    <View className="flex-1 p-4 justify-center bg-gray-50">
      <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        {/* Ticket Header Skeleton */}
        <View className="bg-gray-300 px-4 py-3 flex-row justify-between items-center">
          <View className="w-32 h-5 bg-gray-400/50 rounded animate-pulse" />
          <View className="w-20 h-6 bg-gray-400/50 rounded-full animate-pulse" />
        </View>

        {/* Welcome Message Skeleton */}
        <View className="px-4 pt-4 pb-2">
          <View className="w-40 h-6 bg-gray-200 rounded animate-pulse mb-1" />
          <View className="w-48 h-4 bg-gray-200 rounded animate-pulse" />
        </View>

        {renderDottedLine()}

        {/* Email Input Skeleton */}
        <View className="px-4 py-2">
          <View className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        </View>

        {/* Password Input Skeleton */}
        <View className="px-4 py-2">
          <View className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        </View>

        {/* Forgot Password Skeleton */}
        <View className="px-4 py-2 items-end">
          <View className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
        </View>

        {/* Button Skeleton */}
        <View className="px-4 py-3">
          <View className="h-12 bg-gray-300 rounded-lg animate-pulse" />
        </View>

        {/* Footer Skeleton */}
        <View className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <View className="w-48 h-5 bg-gray-200 rounded animate-pulse mx-auto" />
        </View>
      </View>
    </View>
  );
};