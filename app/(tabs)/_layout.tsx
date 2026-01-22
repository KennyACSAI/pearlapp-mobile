import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Network, Users, FileText, Search } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolateColor,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Colors, Shadows } from '@/constants';

const ICON_SIZE = 29;
const ICON_STROKE = 2;
const TAB_BAR_HEIGHT = 50;
const TAB_BAR_PADDING_TOP = 17;

interface TabBarIconProps {
  focused: boolean;
  icon: React.ReactNode;
}

function TabBarIcon({ focused, icon }: TabBarIconProps) {
  const scale = useSharedValue(1);
  const activeProgress = useSharedValue(0);

  // Animate when focused changes
  useEffect(() => {
    activeProgress.value = withSpring(focused ? 1 : 0, {
      damping: 20,
      stiffness: 300,
    });

    // Subtle bounce effect on selection
    if (focused) {
      scale.value = withSpring(1.15, { damping: 12, stiffness: 400 }, () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      });
    }
  }, [focused]);

  const animatedIconContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      activeProgress.value,
      [0, 1],
      ['transparent', 'rgba(0, 0, 0, 0.08)']
    ),
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.tabItem}>
      <Animated.View style={[styles.iconContainer, animatedIconContainerStyle]}>
        {icon}
      </Animated.View>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const bottomPadding = Math.max(insets.bottom, TAB_BAR_PADDING_TOP);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: bottomPadding,
            height: TAB_BAR_HEIGHT + bottomPadding,
          },
        ],
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.text.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarItemStyle: styles.tabBarItem,
        sceneStyle: styles.sceneStyle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              focused={focused}
              icon={<Bell size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color} />}
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
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sceneStyle: {
    backgroundColor: '#FFFFFF',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.border[10],
    paddingTop: TAB_BAR_PADDING_TOP,
    ...Shadows.tabBar,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 48,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 32,
    borderRadius: 16,
  },
});