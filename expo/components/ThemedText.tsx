import React from 'react';
import { Text, TextProps } from 'react-native';
import { Typography } from '@/constants/Typography';
import { AppColors } from '@/constants/colors';

export type ThemedTextProps = TextProps & {
  type?: keyof typeof Typography;
  color?: string;
};

export function ThemedText({ style, type = 'body', color = AppColors.textPrimary, ...rest }: ThemedTextProps) {
  return (
    <Text
      style={[
        Typography[type],
        { color },
        style,
      ]}
      {...rest}
    />
  );
}
