import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#C5A059',
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
            console.warn('Failed to get push token for push notification!');
            return;
        }

        // In SDK 49+ projectId is required for EAS Build, but optional for pure Expo Go
        // We try to get token without explicitly passing projectId first.
        try {
            const tokenConfig = await Notifications.getExpoPushTokenAsync();
            token = tokenConfig.data;
        } catch (e) {
            console.warn('Error fetching token:', e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export async function saveUserPushToken(userId: string, token: string) {
    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({ expo_push_token: token })
            .eq('id', userId);

        if (error) throw error;
    } catch (err) {
        console.error('Error saving push token to Supabase:', err);
    }
}

// Helper to trigger a local FOMO notification for demonstration
export async function scheduleLocalFOMOAlert() {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "🔥 TECHNO RITUAL: ALMOST SOLD OUT",
            body: "Only 10 tickets remaining for tonight's session. Secure your spot now.",
            data: { route: 'Lineup' },
        },
        trigger: { seconds: 5 }, // triggers 5 seconds after calling
    });
}
