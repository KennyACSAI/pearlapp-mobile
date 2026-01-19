import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors, Typography, BorderRadius, Spacing, Shadows, Animation } from '@/constants';

interface TextFieldProps extends Omit<TextInputProps, 'onChange'> {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  error?: string;
  helper?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export function TextField({
  label,
  value,
  onChange,
  onChangeText,
  placeholder,
  error,
  helper,
  multiline = false,
  rows = 3,
  disabled = false,
  containerStyle,
  inputStyle,
  ...props
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const borderColor = useSharedValue(colors.borderOpacity[15]);
  const shadowOpacity = useSharedValue(0.1);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  const handleFocus = () => {
    setIsFocused(true);
    borderColor.value = withTiming(
      error ? colors.borderOpacity[60] : colors.borderOpacity[30],
      { duration: Animation.duration.normal }
    );
    shadowOpacity.value = withTiming(0.15, { duration: Animation.duration.normal });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderColor.value = withTiming(
      error ? colors.borderOpacity[60] : colors.borderOpacity[15],
      { duration: Animation.duration.normal }
    );
    shadowOpacity.value = withTiming(0.1, { duration: Animation.duration.normal });
  };

  const handleChangeText = (text: string) => {
    onChange?.(text);
    onChangeText?.(text);
  };

  const inputHeight = multiline ? Math.max(80, rows * 22.4) : undefined;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Animated.View
        style={[
          styles.inputContainer,
          error && styles.inputError,
          isFocused && Shadows.md,
          animatedContainerStyle,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.textOpacity[40]}
          multiline={multiline}
          numberOfLines={multiline ? rows : 1}
          editable={!disabled}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            multiline && { height: inputHeight },
            disabled && styles.inputDisabled,
            inputStyle,
          ]}
          {...props}
        />
      </Animated.View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {helper && !error && <Text style={styles.helperText}>{helper}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing[1.5],
  },
  label: {
    ...Typography.subheadline,
    fontWeight: '500',
    color: colors.text,
  },
  inputContainer: {
    backgroundColor: colors.surfaceOpacity[80],
    borderWidth: 1,
    borderColor: colors.borderOpacity[15],
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  input: {
    ...Typography.callout,
    color: colors.text,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    minHeight: 44,
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: Spacing[2.5],
  },
  inputError: {
    borderColor: colors.borderOpacity[60],
  },
  inputDisabled: {
    opacity: 0.5,
  },
  errorText: {
    ...Typography.footnote,
    color: colors.textOpacity[60],
  },
  helperText: {
    ...Typography.footnote,
    color: colors.textOpacity[40],
  },
});