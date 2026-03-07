import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MapScreen } from '../screens/MapScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LineupScreen } from '../screens/LineupScreen';
import { EventDetailScreen } from '../screens/EventDetailScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { TicketCheckoutScreen } from '../screens/TicketCheckoutScreen';
import { MyTicketsScreen } from '../screens/MyTicketsScreen';
import { VIPScreen } from '../screens/VIPScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { WalkInScreen } from '../screens/WalkInScreen';
import { DigitalPassScreen } from '../screens/DigitalPassScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { theme } from '../theme';

export interface EventItem {
    id: string;
    date_label: string;
    title: string;
    stage: string;
    bpm: string;
    image: string;
    status: 'LIMITED' | 'SOLD OUT' | 'AVAILABLE';
    is_past?: boolean;
    is_published?: boolean;
    description?: string;
    lineup?: string[] | any;
    event_date?: string;
    venue_room?: string;
    genre?: string;
}

export type RootStackParamList = {
    Auth: undefined;
    SignUp: undefined;
    MainTabs: undefined;
    EventDetail: { event: EventItem };
    Settings: undefined;
    Checkout: {
        tableId: string;
        tableNumber: string;
        capacity: number;
        date: string;
        time: string;
        minSpend: number;
    };
    TicketCheckout: {
        eventId: string;
        eventTitle: string;
        eventImage: string;
        eventDate: string;
        cart: Array<{
            ticketTypeId: string;
            ticketTypeName: string;
            quantity: number;
            priceEach: number;
        }>;
        totalPrice: number;
    };
    MyTickets: undefined;
    WalkIn: undefined;
    About: undefined;
    DigitalPass: {
        bookingId: string;
        qrData: string;
        type: string;
        guests: number;
        date: string;
        timestamp?: number;
    };
    AdminDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.primary,
                headerTitleStyle: { fontFamily: theme.typography.fontFamily.heading },
                headerShadowVisible: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.background,
                    borderTopColor: theme.colors.border,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'help-outline';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Lineup') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Map') {
                        iconName = focused ? 'map' : 'map-outline';
                    } else if (route.name === 'VIP') {
                        iconName = focused ? 'diamond' : 'diamond-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'HOME', headerShown: false }} />
            <Tab.Screen name="Lineup" component={LineupScreen} options={{ title: 'EVENTS', headerShown: false }} />
            <Tab.Screen name="Map" component={MapScreen} options={{ title: 'BOOK' }} />
            <Tab.Screen name="VIP" component={VIPScreen} options={{ title: 'VIP', headerShown: false }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'PROFILE', headerShown: false }} />
        </Tab.Navigator>
    );
};

export const RootNavigator = () => {
    const { session, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {session ? (
                    // User is signed in, show the Main Tabs
                    <>
                        <Stack.Screen
                            name="MainTabs"
                            component={MainTabs}
                        />
                        <Stack.Screen
                            name="EventDetail"
                            component={EventDetailScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Settings"
                            component={SettingsScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Checkout"
                            component={CheckoutScreen}
                            options={{ headerShown: false, presentation: 'fullScreenModal' }}
                        />
                        <Stack.Screen
                            name="WalkIn"
                            component={WalkInScreen}
                            options={{ headerShown: false, presentation: 'modal' }}
                        />
                        <Stack.Screen
                            name="About"
                            component={AboutScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="DigitalPass"
                            component={DigitalPassScreen}
                            options={{ headerShown: false, presentation: 'fullScreenModal' }}
                        />
                        <Stack.Screen
                            name="AdminDashboard"
                            component={AdminDashboardScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="TicketCheckout"
                            component={TicketCheckoutScreen}
                            options={{ headerShown: false, presentation: 'fullScreenModal' }}
                        />
                        <Stack.Screen
                            name="MyTickets"
                            component={MyTicketsScreen}
                            options={{ headerShown: false }}
                        />
                    </>
                ) : (
                    // User is not signed in
                    <>
                        <Stack.Screen
                            name="Auth"
                            component={LoginScreen}
                        />
                        <Stack.Screen
                            name="SignUp"
                            component={SignUpScreen}
                            options={{ headerShown: false }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
