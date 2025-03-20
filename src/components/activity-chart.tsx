import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Colors from '@/lib/constants/colors';

interface ActivityChartProps {
  data: { date: string; count: number }[];
}

export default function ActivityChart({ data }: ActivityChartProps) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { weekday: 'short' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Activity</Text>
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const barHeight = (item.count / maxCount) * 100;
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barLabelContainer}>
                <Text style={styles.barValue}>{item.count}</Text>
              </View>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    { height: `${Math.max(barHeight, 5)}%` },
                    item.count > 0 ? styles.activeBar : null,
                  ]}
                />
              </View>
              <Text style={styles.barDay}>{getDayName(item.date)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barLabelContainer: {
    marginBottom: 4,
  },
  barValue: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  barWrapper: {
    height: 100,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: 8,
    backgroundColor: Colors.mediumGray,
    borderRadius: 4,
  },
  activeBar: {
    backgroundColor: Colors.primary,
  },
  barDay: {
    fontSize: 12,
    color: Colors.darkGray,
    marginTop: 8,
  },
});
