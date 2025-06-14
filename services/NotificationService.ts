import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

// Configurar como se muestran las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;
  private isInitialized: boolean = false;
  private notificationsConfigured: boolean = false;
  private readonly NOTIFICATIONS_KEY = 'notifications_configured';

  async registerForPushNotificationsAsync() {
    try {
      let token;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'AppCables Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          showBadge: true,
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          Alert.alert(
            'Permisos de notificación',
            'No se pudieron obtener permisos para notificaciones. Algunas funciones pueden no estar disponibles.',
            [{ text: 'OK' }]
          );
          return null;        }
        
        // No intentar obtener push token en Expo Go
        if (Constants.appOwnership === 'expo') {
          console.log('Ejecutándose en Expo Go - notificaciones push no disponibles');
          console.log('Las notificaciones locales funcionarán normalmente');
          this.expoPushToken = null;
          this.isInitialized = true;
          return null;
        }
        
        // Solo para development builds
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (projectId) {
          try {
            token = (await Notifications.getExpoPushTokenAsync({
              projectId: projectId,
            })).data;
          } catch (error) {
            console.warn('Error getting push token:', error);
          }
        }
      } else {
        console.log('Las notificaciones push requieren un dispositivo físico');
      }

      this.expoPushToken = token || null;
      this.isInitialized = true;
      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);      return null;
    }
  }
  async scheduleNotificationReminder() {
    try {
      console.log('Programando recordatorio diario...');
      
      // Cancelar recordatorios previos
      await this.cancelDailyReminders();
      
      // Programar notificación diaria a las 6 PM
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "📏 ¡No olvides registrar tu cable!",
          body: "Es hora de registrar el metraje de cable usado hoy",
          data: { type: 'daily_reminder' },
        },
        trigger: {
          hour: 18,
          minute: 0,
          repeats: true,
        } as Notifications.CalendarTriggerInput,
      });
      
      console.log(`Recordatorio diario programado para las 6 PM (ID: ${notificationId})`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
      throw error;
    }
  }

  async scheduleWeeklyReport() {
    try {
      // Cancelar reportes semanales previos
      await this.cancelWeeklyReports();
      
      // Programar reporte semanal los domingos a las 8 PM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📊 Reporte Semanal",
          body: "Revisa tu resumen semanal de uso de cables",
          data: { type: 'weekly_report' },
        },
        trigger: {
          weekday: 1, // Domingo = 1
          hour: 20,
          minute: 0,
          repeats: true,
        } as Notifications.CalendarTriggerInput,
      });
      
      console.log('Reporte semanal programado para domingos a las 8 PM');
    } catch (error) {
      console.error('Error scheduling weekly report:', error);
      throw error;
    }
  }

  async sendImmediateNotification(title: string, body: string) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'immediate' },
        },
        trigger: null, // Enviar inmediatamente
      });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
      // No lanzar error para notificaciones inmediatas
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Todas las notificaciones programadas han sido canceladas');
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  async cancelDailyReminders() {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const dailyReminders = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'daily_reminder'
      );
      
      for (const notification of dailyReminders) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Error canceling daily reminders:', error);
    }
  }

  async cancelWeeklyReports() {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const weeklyReports = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'weekly_report'
      );
      
      for (const notification of weeklyReports) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Error canceling weekly reports:', error);
    }
  }

  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
  isReady() {
    return this.isInitialized;
  }

  getExpoPushToken() {
    return this.expoPushToken;
  }

  // Función de prueba para verificar que las notificaciones funcionan
  async testNotification() {
    try {
      await this.sendImmediateNotification(
        '🔔 Prueba de notificación',
        'Las notificaciones están funcionando correctamente'
      );
      return true;
    } catch (error) {
      console.error('Error testing notification:', error);
      return false;
    }
  }

  // Función para mostrar estadísticas de notificaciones programadas
  async getNotificationStats() {
    try {
      const scheduled = await this.getScheduledNotifications();
      const dailyReminders = scheduled.filter(n => n.content.data?.type === 'daily_reminder');
      const weeklyReports = scheduled.filter(n => n.content.data?.type === 'weekly_report');
      
      return {
        total: scheduled.length,
        dailyReminders: dailyReminders.length,
        weeklyReports: weeklyReports.length,
        scheduled,
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return {
        total: 0,
        dailyReminders: 0,
        weeklyReports: 0,
        scheduled: [],
      };
    }
  }

  async areNotificationsConfigured(): Promise<boolean> {
    try {
      const configured = await AsyncStorage.getItem(this.NOTIFICATIONS_KEY);
      return configured === 'true';
    } catch (error) {
      console.error('Error checking notifications configuration:', error);
      return false;
    }
  }

  async markNotificationsAsConfigured(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.NOTIFICATIONS_KEY, 'true');
      this.notificationsConfigured = true;
    } catch (error) {
      console.error('Error marking notifications as configured:', error);
    }
  }

  async initializeNotifications(): Promise<void> {
    try {
      // Verificar si ya fueron configuradas
      const alreadyConfigured = await this.areNotificationsConfigured();
      if (alreadyConfigured && this.notificationsConfigured) {
        console.log('Notificaciones ya configuradas, omitiendo...');
        return;
      }

      // Registrar para notificaciones push
      await this.registerForPushNotificationsAsync();
      
      // Programar recordatorios solo si no están configurados
      if (!alreadyConfigured) {
        await this.scheduleNotificationReminder();
        await this.scheduleWeeklyReport();
        await this.markNotificationsAsConfigured();
        console.log('Notificaciones configuradas por primera vez');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  async resetNotificationsConfiguration(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.NOTIFICATIONS_KEY);
      this.notificationsConfigured = false;
      await this.cancelAllNotifications();
      console.log('Configuración de notificaciones reseteada');
    } catch (error) {
      console.error('Error resetting notifications configuration:', error);
    }
  }
}

export default new NotificationService();
