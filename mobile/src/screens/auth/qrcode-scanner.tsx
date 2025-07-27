import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
// import { Camera, useCameraDevices } from 'react-native-vision-camera';
// import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { X, Flashlight, FlashlightOff } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const scanAreaSize = width * 0.7;

interface QRCodeScannerScreenProps {
  onClose: () => void;
  onQRCodeScanned: (data: string) => void;
}

export const QRCodeScannerScreen: React.FC<QRCodeScannerScreenProps> = ({
  onClose,
  // onQRCodeScanned,
}) => {
  // const [hasPermission, setHasPermission] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  // const devices = useCameraDevices();
  // const device = devices.find((d) => d.position === 'back');

  // const [scannerFrameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
  //   checkInverted: true,
  // });
  // const frameProcessor = useFrameProcessor((frame) => {
  //   scannerFrameProcessor(frame);
  // }, [scannerFrameProcessor]);

  // useEffect(() => {
  //   checkCameraPermission();
  // }, []);

  // useEffect(() => {
  //   if (barcodes.length > 0) {
  //     const qrCode = barcodes[0];
  //     if (qrCode.displayValue) {
  //       onQRCodeScanned(qrCode.displayValue);
  //     }
  //   }
  // }, [barcodes, onQRCodeScanned]);

  // const checkCameraPermission = async () => {
  //   try {
  //     const permission = await Camera.requestCameraPermission();
  //     setHasPermission(permission === 'granted');
  //   } catch (error) {
  //     Alert.alert('خطأ', 'لا يمكن الوصول إلى الكاميرا');
  //   }
  // };

  const toggleFlash = () => {
    setIsFlashOn(!isFlashOn);
  };

  // if (!hasPermission) {
  //   return (
  //     <SafeAreaView className="flex-1 bg-black">
  //       <StatusBar barStyle="light-content" backgroundColor="#000000" />
  //       <View className="flex-1 items-center justify-center px-5">
  //         <Text className="text-white text-lg text-center mb-5">
  //           يرجى السماح بالوصول إلى الكاميرا لمسح رمز QR
  //         </Text>
  //         <TouchableOpacity
  //           className="bg-violet-500 px-6 py-3 rounded-lg"
  //           // onPress={checkCameraPermission}
  //         >
  //           <Text className="text-white text-base font-semibold">إعطاء الإذن</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </SafeAreaView>
  //   );
  // }

  // if (!device) {
  //   return (
  //     <SafeAreaView className="flex-1 bg-black">
  //       <StatusBar barStyle="light-content" backgroundColor="#000000" />
  //       <View className="flex-1 items-center justify-center px-5">
  //         <Text className="text-white text-lg text-center">لا توجد كاميرا متاحة</Text>
  //       </View>
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* <Camera
        className="flex-1"
        device={device}
        isActive={true}
        // frameProcessor={frameProcessor}
        torch={isFlashOn ? 'on' : 'off'}
      /> */}

      <View className="absolute inset-0 bg-black/50">
        <View className="flex-row justify-between items-center px-5 pt-5 pb-2.5">
          <TouchableOpacity 
            className="w-11 h-11 rounded-full bg-black/50 items-center justify-center"
            onPress={onClose}
          >
            <X size={24} />
          </TouchableOpacity>
          <TouchableOpacity 
            className="w-11 h-11 rounded-full bg-black/50 items-center justify-center"
            onPress={toggleFlash}
          >
            {isFlashOn ? (
              <FlashlightOff size={24} />
            ) : (
              <Flashlight size={24} />
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-white text-base text-center mb-10 leading-6">
            اربط الجهاز بحيث يجب أن يظهر نظام Pharsy ويذهب
            إلى الإعدادات ثم رمز الاستجابة السريعة على
            أضافته جهاز جديد ثم امسح رمز الـ QR من
            بواسطتك
          </Text>
          
          <View 
            className="relative"
            style={{ width: scanAreaSize, height: scanAreaSize }}
          >
            <View className="absolute top-0 left-0 w-7.5 h-7.5 border-l-3 border-t-3 border-violet-500" />
            <View className="absolute top-0 right-0 w-7.5 h-7.5 border-r-3 border-t-3 border-violet-500" />
            <View className="absolute bottom-0 left-0 w-7.5 h-7.5 border-l-3 border-b-3 border-violet-500" />
            <View className="absolute bottom-0 right-0 w-7.5 h-7.5 border-r-3 border-b-3 border-violet-500" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};