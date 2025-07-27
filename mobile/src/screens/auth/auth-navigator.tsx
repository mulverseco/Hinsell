// navigation/AuthNavigator.tsx
import React, { useState } from 'react';
import { WelcomeScreen } from '@/screens/auth';
import { Login } from '@/screens/auth/login';
import { QRCodeScannerScreen } from '@/screens/auth/qrcode-scanner';

type AuthScreen = 'welcome' | 'login' | 'qr-scanner';

export const AuthNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('welcome');

  const handleQRCodeScanned = (data: string) => {
    console.log('QR Code scanned:', data);
    setCurrentScreen('welcome');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onLinkQR={() => setCurrentScreen('qr-scanner')}
            onLogin={() => setCurrentScreen('login')}
          />
        );
      
      case 'login':
        return (
          <Login />
        );
      
      case 'qr-scanner':
        return (
          <QRCodeScannerScreen
            onClose={() => setCurrentScreen('login')}
            onQRCodeScanned={handleQRCodeScanned}
          />
        );
      
      default:
        return null;
    }
  };

  return renderScreen();
};