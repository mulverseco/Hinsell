/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useGetReportTemplatesQuery } from '@/core/services/api';
import { ReportTemplate } from '@/core/types';
import { Header } from '@/components/header';

interface ReportTemplatesScreenProps {
  onTemplatePress: (template: ReportTemplate) => void;
  onProfilePress: () => void;
  onMenuPress: () => void;
}

const ReportIcon: React.FC<{ icon?:string }> = ({icon ="" }) => (
  <View className="items-center justify-center">
    <Text className={"text-3xl"}>{icon}</Text>
  </View>
);

export const ReportTemplatesScreen: React.FC<ReportTemplatesScreenProps> = ({
  onTemplatePress,
}) => {  

  const { 
    data: templatesData, 
    isLoading, 
    error,
    refetch 
  } = useGetReportTemplatesQuery({
    page: 1,
    page_size: 50,
  });

  const handleTemplatePress = (template: ReportTemplate) => {
    onTemplatePress(template);
  };

  const handleRefresh = () => {
    refetch();
  };

  const renderTemplateCard = ({ item }: { item: ReportTemplate }) => (
    <TouchableOpacity
      className="flex-1 items-center my-6 gap-4"
      style={{ maxWidth: '31%' }}
      onPress={() => handleTemplatePress(item)}
      activeOpacity={0.85}
    >
      <ReportIcon icon={item.category.icon} />
      <View className='p-4 bg-gray-100 rounded-2xl'>
      <Text
        className="text-sm font-semibold text-center mt-3"
        numberOfLines={2}
      >
        {item.name}
      </Text>
      <Text
        className="text-xs text-center mt-1 text-gray-500"
        numberOfLines={1}
      >
        {item.category.name}
      </Text>
      </View>
    </TouchableOpacity>
  );


  if (error) {
    return (
      <SafeAreaView className="flex-1 ">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white text-lg text-center mb-4">
            حدث خطأ في تحميل التقارير
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-lg"
            onPress={handleRefresh}
          >
            <Text className="text-white font-medium">إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
      <View className='flex-1 bg-white'>
        <Header/>
      <View className="flex-1 px-2 pt-4 border-l">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text className="text-gray-400 mt-4">جاري تحميل التقارير...</Text>
          </View>
        ) : templatesData?.results.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <ReportIcon />
            <Text className="text-white text-lg font-medium text-center mt-4 mb-2">
              لا توجد تقارير
            </Text>
          </View>
        ) : (
          <FlatList
            data={templatesData?.results || []}
            renderItem={renderTemplateCard}
            keyExtractor={(item) => item.id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingBottom: 100,
              paddingHorizontal: 8,
            }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            onRefresh={handleRefresh}
            refreshing={isLoading}
          />
        )}
      </View>
    </View>
  );
};