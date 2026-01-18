import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { AppColors } from '@/constants/colors';
import { sfProDisplayBold, sfProDisplayMedium, sfProDisplayRegular } from '@/constants/Typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

interface AnimatedDonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
  delay?: number;
}

export function AnimatedDonutChart({
  segments,
  size = 180,
  strokeWidth = 24,
  centerLabel,
  centerValue,
  delay = 0,
}: AnimatedDonutChartProps) {
  const animatedValues = useRef(segments.map(() => new Animated.Value(0))).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const total = useMemo(() => segments.reduce((sum, s) => sum + s.value, 0), [segments]);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        ...animatedValues.map((anim, index) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            delay: index * 100,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          })
        ),
      ]),
    ]).start();
  }, [delay, fadeAnim, scaleAnim, animatedValues]);

  let cumulativeAngle = -90;

  return (
    <Animated.View
      style={[
        styles.donutContainer,
        {
          width: size,
          height: size,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={[styles.donutSvgContainer, { width: size, height: size }]}>
        {segments.map((segment, index) => {
          const percentage = total > 0 ? segment.value / total : 0;
          const segmentColor = segment.color;
          const rotation = cumulativeAngle;
          cumulativeAngle += percentage * 360;

          return (
            <Animated.View
              key={index}
              style={[
                styles.donutSegment,
                {
                  width: size,
                  height: size,
                  transform: [{ rotate: `${rotation}deg` }],
                },
              ]}
            >
              <View
                style={[
                  styles.donutRing,
                  {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: 'transparent',
                    borderTopColor: segmentColor,
                    borderRightColor: percentage > 0.25 ? segmentColor : 'transparent',
                    borderBottomColor: percentage > 0.5 ? segmentColor : 'transparent',
                    borderLeftColor: percentage > 0.75 ? segmentColor : 'transparent',
                  },
                ]}
              />
            </Animated.View>
          );
        })}
      </View>
      <View style={styles.donutCenter}>
        {centerValue && (
          <Text style={styles.donutCenterValue}>{centerValue}</Text>
        )}
        {centerLabel && (
          <Text style={styles.donutCenterLabel}>{centerLabel}</Text>
        )}
      </View>
    </Animated.View>
  );
}

interface BarData {
  label: string;
  value: number;
  color: string;
}

interface AnimatedBarChartProps {
  data: BarData[];
  maxValue?: number;
  height?: number;
  delay?: number;
  showValues?: boolean;
}

export function AnimatedBarChart({
  data,
  maxValue,
  height = 160,
  delay = 0,
  showValues = true,
}: AnimatedBarChartProps) {
  const animatedHeights = useRef(data.map(() => new Animated.Value(0))).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.min(40, (SCREEN_WIDTH - 80) / data.length - 12);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        ...animatedHeights.map((anim, index) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            delay: index * 80,
            easing: Easing.out(Easing.back(1.2)),
            useNativeDriver: false,
          })
        ),
      ]),
    ]).start();
  }, [delay, fadeAnim, animatedHeights]);

  return (
    <Animated.View style={[styles.barChartContainer, { opacity: fadeAnim }]}>
      <View style={[styles.barChartContent, { height }]}>
        {data.map((item, index) => {
          const barHeight = animatedHeights[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, (item.value / max) * (height - 40)],
          });

          return (
            <View key={index} style={styles.barColumn}>
              <View style={[styles.barWrapper, { height: height - 40 }]}>
                {showValues && (
                  <Animated.Text
                    style={[
                      styles.barValue,
                      {
                        opacity: animatedHeights[index],
                      },
                    ]}
                  >
                    {formatCompact(item.value)}
                  </Animated.Text>
                )}
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      width: barWidth,
                      height: barHeight,
                      backgroundColor: item.color,
                      borderRadius: barWidth / 4,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

interface LineDataPoint {
  value: number;
  label?: string;
}

interface AnimatedLineChartProps {
  data: LineDataPoint[];
  height?: number;
  color?: string;
  gradientColor?: string;
  delay?: number;
  showDots?: boolean;
  showLabels?: boolean;
}

export function AnimatedLineChart({
  data,
  height = 120,
  color = AppColors.primary,
  delay = 0,
  showDots = true,
  showLabels = true,
}: AnimatedLineChartProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef(data.map(() => new Animated.Value(0))).current;

  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;
  const chartWidth = SCREEN_WIDTH - 80;
  const pointSpacing = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        ...dotAnims.map((anim, index) =>
          Animated.sequence([
            Animated.delay(index * 80),
            Animated.spring(anim, {
              toValue: 1,
              friction: 6,
              tension: 100,
              useNativeDriver: true,
            }),
          ])
        ),
      ]),
    ]).start();
  }, [delay, progressAnim, fadeAnim, dotAnims]);

  const points = data.map((point, index) => {
    const x = index * pointSpacing;
    const y = height - 30 - ((point.value - min) / range) * (height - 50);
    return { x, y, value: point.value, label: point.label };
  });

  return (
    <Animated.View style={[styles.lineChartContainer, { height, opacity: fadeAnim }]}>
      <View style={styles.lineChartContent}>
        {points.map((point, index) => {
          if (index === 0) return null;
          const prevPoint = points[index - 1];
          const lineWidth = Math.sqrt(
            Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
          );
          const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * (180 / Math.PI);

          return (
            <Animated.View
              key={`line-${index}`}
              style={[
                styles.lineSegment,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, lineWidth],
                  }),
                  height: 3,
                  backgroundColor: color,
                  left: prevPoint.x,
                  top: prevPoint.y,
                  transform: [{ rotate: `${angle}deg` }],
                  transformOrigin: 'left center',
                },
              ]}
            />
          );
        })}

        {showDots &&
          points.map((point, index) => (
            <Animated.View
              key={`dot-${index}`}
              style={[
                styles.lineDot,
                {
                  left: point.x - 6,
                  top: point.y - 6,
                  backgroundColor: color,
                  opacity: dotAnims[index],
                  transform: [
                    {
                      scale: dotAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
      </View>

      {showLabels && (
        <View style={styles.lineLabelsContainer}>
          {points.map((point, index) => (
            <Text
              key={`label-${index}`}
              style={[
                styles.lineLabel,
                { left: point.x - 15, width: 30 },
              ]}
              numberOfLines={1}
            >
              {point.label || ''}
            </Text>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

interface AnimatedProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  value?: string;
  delay?: number;
}

export function AnimatedProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = AppColors.primary,
  bgColor = '#F0F0F0',
  label,
  value,
  delay = 0,
}: AnimatedProgressRingProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: clampedProgress / 100,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, [delay, progressAnim, scaleAnim, clampedProgress]);

  return (
    <Animated.View
      style={[
        styles.progressRingContainer,
        { width: size, height: size, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View
        style={[
          styles.progressRingBg,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: bgColor,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.progressRingFill,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: color,
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
            transform: [
              {
                rotate: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      />
      <View style={styles.progressRingCenter}>
        {value && <Text style={styles.progressRingValue}>{value}</Text>}
        {label && <Text style={styles.progressRingLabel}>{label}</Text>}
      </View>
    </Animated.View>
  );
}

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  delay?: number;
}

export function AnimatedSparkline({
  data,
  width = 80,
  height = 30,
  color = AppColors.primary,
  delay = 0,
}: SparklineProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pointSpacing = data.length > 1 ? width / (data.length - 1) : width;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [delay, progressAnim]);

  const points = data.map((value, index) => {
    const x = index * pointSpacing;
    const y = height - ((value - min) / range) * height;
    return { x, y };
  });

  return (
    <View style={[styles.sparklineContainer, { width, height }]}>
      {points.map((point, index) => {
        if (index === 0) return null;
        const prevPoint = points[index - 1];
        const lineWidth = Math.sqrt(
          Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
        );
        const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * (180 / Math.PI);

        return (
          <Animated.View
            key={index}
            style={[
              styles.sparklineSegment,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, lineWidth],
                }),
                height: 2,
                backgroundColor: color,
                left: prevPoint.x,
                top: prevPoint.y - 1,
                transform: [{ rotate: `${angle}deg` }],
                transformOrigin: 'left center',
              },
            ]}
          />
        );
      })}
    </View>
  );
}

interface AnimatedStatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  delay?: number;
  sparklineData?: number[];
}

export function AnimatedStatCard({
  label,
  value,
  subValue,
  icon,
  trend,
  trendValue,
  color = AppColors.primary,
  delay = 0,
  sparklineData,
}: AnimatedStatCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, fadeAnim, slideAnim, scaleAnim]);

  const trendColor = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#71717A';

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.statCardHeader}>
        {icon && (
          <View style={[styles.statCardIcon, { backgroundColor: `${color}15` }]}>
            {icon}
          </View>
        )}
        {sparklineData && sparklineData.length > 0 && (
          <AnimatedSparkline data={sparklineData} color={color} delay={delay + 200} />
        )}
      </View>
      <Text style={styles.statCardLabel}>{label}</Text>
      <Text style={[styles.statCardValue, { color }]}>{value}</Text>
      {(subValue || trendValue) && (
        <View style={styles.statCardFooter}>
          {subValue && <Text style={styles.statCardSubValue}>{subValue}</Text>}
          {trendValue && (
            <Text style={[styles.statCardTrend, { color: trendColor }]}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </Text>
          )}
        </View>
      )}
    </Animated.View>
  );
}

function formatCompact(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(0);
}

const styles = StyleSheet.create({
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutSvgContainer: {
    position: 'absolute',
  },
  donutSegment: {
    position: 'absolute',
  },
  donutRing: {
    position: 'absolute',
  },
  donutCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  donutCenterLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  barChartContainer: {
    width: '100%',
  },
  barChartContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    minHeight: 4,
  },
  barValue: {
    fontFamily: sfProDisplayMedium,
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  barLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 10,
    color: '#71717A',
    marginTop: 8,
    textAlign: 'center',
  },
  lineChartContainer: {
    width: '100%',
  },
  lineChartContent: {
    flex: 1,
    position: 'relative',
  },
  lineSegment: {
    position: 'absolute',
    borderRadius: 2,
  },
  lineDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  lineLabelsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    flexDirection: 'row',
  },
  lineLabel: {
    position: 'absolute',
    fontFamily: sfProDisplayRegular,
    fontSize: 9,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingBg: {
    position: 'absolute',
  },
  progressRingFill: {
    position: 'absolute',
  },
  progressRingCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  progressRingLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 9,
    color: '#71717A',
  },
  sparklineContainer: {
    position: 'relative',
  },
  sparklineSegment: {
    position: 'absolute',
    borderRadius: 1,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
    marginBottom: 4,
  },
  statCardValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 24,
    fontWeight: '700' as const,
  },
  statCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statCardSubValue: {
    fontFamily: sfProDisplayRegular,
    fontSize: 11,
    color: '#A1A1AA',
  },
  statCardTrend: {
    fontFamily: sfProDisplayMedium,
    fontSize: 11,
    fontWeight: '600' as const,
  },
});
