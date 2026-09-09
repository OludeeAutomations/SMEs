import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

type BrandLogoProps = {
  variant?: 'wordmark' | 'mark';
  tone?: 'brand' | 'white';
  width?: number;
  style?: StyleProp<ImageStyle>;
};

const wordmark = require('../../assets/website/rekoda-logo.png');
const whiteWordmark = require('../../assets/images/rekoda-logo-white.png');
const mark = require('../../assets/images/favicon.png');

export default function BrandLogo({ variant = 'wordmark', tone = 'brand', width, style }: BrandLogoProps) {
  const isMark = variant === 'mark';
  const resolvedWidth = width ?? (isMark ? 40 : 144);
  const source = isMark ? mark : tone === 'white' ? whiteWordmark : wordmark;

  return (
    <Image
      accessibilityLabel="Rekọda"
      accessible
      resizeMode="contain"
      source={source}
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
