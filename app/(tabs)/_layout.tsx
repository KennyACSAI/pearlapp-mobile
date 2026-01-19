import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Network, Users, FileText, Search } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Colors, Typography } from '@/constants';

const ICON_SIZE = 24;
const ICON_STROKE = 2.5;

interface TabBarIconProps {
  focused: boolean;
  icon: React.ReactNode;
  label: string;
}

function TabBarIcon({ focused, icon, label }: TabBarIconProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.tabItem, animatedStyle]}>
      <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
        {icon}
      </View>
      <Text style={[
        styles.tabLabel,
        focused ? styles.tabLabelActive : styles.tabLabelInactive
      ]}>
        {label}
      </Text>
    </Animated.View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { paddingBottom: Math.max(insets.bottom, 8) }
        ],
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.text.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon 
              focused={focused} 
              icon={<Bell size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color} />}
              label="Reminders"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mindmap"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon 
              focused={focused} 
              icon={<Network size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color} />}
              label="Mindmap"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon 
              focused={focused} 
              icon={<Users size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color} />}
              label="Contacts"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon 
              focused={focused} 
              icon={<FileText size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color} />}
              label="Logs"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon 
              focused={focused} 
              icon={<Search size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color} />}
              label="Search"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface[95] || Colors.surfaceOpacity?.[95] || 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 2,
    borderTopColor: Colors.border[15],
    paddingTop: 8,
    height: 'auto',
    minHeight: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {},
  tabLabel: {
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
  },
  tabLabelActive: {
    opacity: 1,
    fontWeight: '500',
  },
  tabLabelInactive: {
    opacity: 0.4,
  },
});