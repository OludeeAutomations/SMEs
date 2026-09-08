import { Image } from 'expo-image';
import React from 'react';
import { ImageStyle, StyleProp } from 'react-native';

type BrandLogoProps = {
  variant?: 'wordmark' | 'mark';
  width?: number;
  style?: StyleProp<ImageStyle>;
};

const wordmark = require('../../assets/website/rekoda-logo.png');
const mark = require('../../assets/images/favicon.png');

export default function BrandLogo({ variant = 'wordmark', width, style }: BrandLogoProps) {
  const isMark = variant === 'mark';
  const resolvedWidth = width ?? (isMark ? 40 : 144);

  return (
    <Image
      accessibilityLabel="Rekọda"
      accessible
      contentFit="contain"
      source={isMark ? mark : wordmark}
      style={[
        {
          width: resolvedWidth,
          height: isMark ? resolvedWidth : resolvedWidth / (743 / 259),
        },
        style,
      ]}
    />
  );
}
