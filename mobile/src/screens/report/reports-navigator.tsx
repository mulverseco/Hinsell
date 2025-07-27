import React, { useState } from 'react';
import { ReportTemplatesScreen } from '@/screens/Report/report-templates';
import { ReportDetailScreen } from '@/screens/Report/report-detail';
import { ReportTemplate } from '@/core/types';

type ReportScreen = 'templates' | 'detail' | 'results';

interface NavigationState {
  screen: ReportScreen;
  selectedTemplate?: ReportTemplate;
  reportResult?: any;
}

export const ReportsNavigator: React.FC = () => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    screen: 'templates',
  });

  const handleTemplatePress = (template: ReportTemplate) => {
    setNavigationState({
      screen: 'detail',
      selectedTemplate: template,
    });
  };


  const handleBackToTemplates = () => {
    setNavigationState({
      screen: 'templates',
    });
  };

  const renderScreen = () => {
    switch (navigationState.screen) {
      case 'templates':
        return (
          <ReportTemplatesScreen
            onTemplatePress={handleTemplatePress}
            onProfilePress={() => console.log('Profile pressed')}
            onMenuPress={() => console.log('Menu pressed')}
          />
        );
      
      case 'detail':
        if (!navigationState.selectedTemplate) {
          return null;
        }
        return (
          <ReportDetailScreen
            template={navigationState.selectedTemplate}
            onBack={handleBackToTemplates}
          />
        );
      
      default:
        return null;
    }
  };

  return renderScreen();
};