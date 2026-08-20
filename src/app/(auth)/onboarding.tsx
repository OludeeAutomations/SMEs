import { useRouter } from 'expo-router';
import { ArrowLeft, ChartNoAxesCombined } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const slides = [
  {
    key: 'operations',
    image: require('../../../assets/onboarding-operations.png'),
    title: 'Know what’s in stock.',
    description:
      'Track products, stock levels, and restocking needs from one organized workspace.',
  },
  {
    key: 'sales',
    image: require('../../../assets/onboarding-sales.png'),
    title: 'Keep every sale moving.',
    description:
      'Create invoices, record payments, and keep your cash flow clear as your business grows.',
  },
  {
    key: 'insights',
    image: require('../../../assets/onboarding-insights.png'),
    title: 'See what’s working.',
    description:
      'Turn your business activity into clear insights that help you make confident decisions.',
  },
] as const;

export default function EaseOnboardingScreen() {
  const router = useRouter();
  const carouselRef = useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const { width } = useWindowDimensions();
  const slideWidth = width;

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextSlide = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    setActiveSlide(Math.min(Math.max(nextSlide, 0), slides.length - 1));
  };

  const showSlide = (index: number) => {
    setActiveSlide(index);
    carouselRef.current?.scrollTo({ x: index * slideWidth, animated: true });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      <View className="flex-1 pb-6 pt-3">
        <View className="h-10 flex-row items-center justify-center px-5">
          <Pressable
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={() => router.back()}
            className="absolute left-5 h-8 w-8 items-center justify-center"
          >
            <ArrowLeft size={20} color="#0F172A" strokeWidth={1.8} />
          </Pressable>

          <View className="flex-row items-center gap-2">
            <View className="h-7 w-7 items-center justify-center rounded-[5px] bg-[#2563EB]">
              <ChartNoAxesCombined size={17} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <Text className="text-lg font-bold text-[#0F172A]">Ease</Text>
          </View>
        </View>

        <View className="flex-1 justify-center">
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            bounces={false}
            decelerationRate="fast"
            onMomentumScrollEnd={handleScrollEnd}
            showsHorizontalScrollIndicator={false}
          >
            {slides.map((slide) => (
              <View
                key={slide.key}
                className="items-center justify-center gap-3 px-5"
                style={{ width: slideWidth }}
              >
                <Image
                  accessibilityIgnoresInvertColors
                  resizeMode="contain"
                  source={slide.image}
                  className="h-[250px] w-[280px]"
                />
                <Text className="w-full text-center text-[27px] font-bold leading-[29px] text-[#0F172A]">
                  {slide.title}
                </Text>
                <Text className="w-full text-center text-sm leading-5 text-[#475569]">
                  {slide.description}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className="items-center gap-[18px] px-5 pt-3">
          <View className="h-[7px] flex-row items-center gap-[7px]">
            {slides.map((slide, index) => (
              <Pressable
                key={slide.key}
                accessibilityLabel={`Show onboarding page ${index + 1}`}
                accessibilityRole="button"
                onPress={() => showSlide(index)}
                className={`h-[7px] rounded-full ${
                  activeSlide === index ? 'w-[22px] bg-[#0B1F5E]' : 'w-[7px] bg-[#BFDBFE]'
                }`}
              />
            ))}
          </View>

          <View className="w-full items-center gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/(auth)/signup')}
              className="h-14 w-full items-center justify-center rounded-[5px] bg-[#0B1F5E] active:bg-[#071845]"
              style={{
                shadowColor: '#0B1F5E',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.13,
                shadowRadius: 20,
                elevation: 4,
              }}
            >
              <Text className="text-base font-bold text-white">Create account</Text>
            </Pressable>

            <View className="flex-row items-center gap-1">
              <Text className="text-[13px] text-[#475569]">Already have an account?</Text>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <Text className="text-[13px] font-bold text-[#2563EB]">Sign in</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
