import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { Search, X } from 'lucide-react-native';
import { colors, Typography, BorderRadius, Spacing, Shadows, Animation } from '@/constants';

interface SearchBarProps extends Omit<TextInputProps, 'onChange' | 'value'> {
  value: string;
  onChange?: (value: string) => void;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  style?: ViewStyle;
}

export function SearchBar({
  value,
  onChange,
  onChangeText,
  placeholder = 'Search...',
  autoFocus = false,
  style,
  ...props
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const borderColor = useSharedValue(colors.borderOpacity[10]);
  const backgroundColor = useSharedValue(colors.surfaceOpacity[80]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    backgroundColor: backgroundColor.value,
  }));

  const handleFocus = () => {
    setIsFocused(true);
    borderColor.value = withTiming(colors.borderOpacity[25], {
      duration: Animation.duration.fast,
    });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderColor.value = withTiming(colors.borderOpacity[10], {
      duration: Animation.duration.fast,
    });
  };

  const handleChangeText = (text: string) => {
    onChange?.(text);
    onChangeText?.(text);
  };

  const handleClear = () => {
    onChange?.('');
    onChangeText?.('');
    inputRef.current?.focus();
  };

  return (
    <Animated.View style={[styles.container, animatedContainerStyle, style]}>
      <Search
        size={18}
        color={colors.textOpacity[40]}
        strokeWidth={2}
        style={styles.searchIcon}
      />

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textOpacity[40]}
        autoFocus={autoFocus}
        style={styles.input}
        returnKeyType="search"
        {...props}
      />

      {value.length > 0 && (
        <Animated.View entering={FadeIn.duration(Animation.duration.fast)}>
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            style={styles.clearButton}
          >
            <X size={16} color={colors.textOpacity[40]} strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    backgroundColor: colors.surfaceOpacity[80],
    borderWidth: 2,
    borderColor: colors.borderOpacity[10],
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  searchIcon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    ...Typography.callout,
    color: colors.text,
    padding: 0,
    margin: 0,
  },
  clearButton: {
    padding: Spacing.xxs,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.surfaceOpacity[60],
  },
});