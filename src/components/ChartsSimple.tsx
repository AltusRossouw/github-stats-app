import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface LanguageChartProps {
  data: { [language: string]: number };
  title?: string;
}

interface ContributionChartProps {
  data: Array<{ week: number; total: number }>;
  title?: string;
}

interface RepositoryStatsProps {
  repositories: Array<{
    name: string;
    stargazers_count: number;
    forks_count: number;
  }>;
  title?: string;
}

// Color palette for charts
const CHART_COLORS = [
  '#0366d6', '#28a745', '#ffd33d', '#f66a0a', '#6f42c1',
  '#d73a49', '#fb8500', '#6610f2', '#20c997', '#fd7e14',
];

// Simple bar component
const SimpleBar: React.FC<{ value: number; maxValue: number; color: string; label: string }> = ({
  value,
  maxValue,
  color,
  label,
}) => {
  const barWidth = Math.max((value / maxValue) * 200, 2);
  return (
    <View style={styles.barContainer}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: barWidth, backgroundColor: color }]} />
      </View>
      <Text style={styles.barValue}>{value}</Text>
    </View>
  );
};

export const LanguagePieChart: React.FC<LanguageChartProps> = ({ data, title = 'Language Distribution' }) => {
  // Convert language data to chart format
  const sortedLanguages = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6); // Top 6 languages

  const totalBytes = sortedLanguages.reduce((sum, [, bytes]) => sum + bytes, 0);

  if (sortedLanguages.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No language data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.languageList}>
        {sortedLanguages.map(([language, bytes], index) => {
          const percentage = ((bytes / totalBytes) * 100).toFixed(1);
          return (
            <View key={language} style={styles.languageItem}>
              <View style={[styles.colorDot, { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }]} />
              <Text style={styles.languageText}>{language}</Text>
              <Text style={styles.percentageText}>{percentage}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const ContributionChart: React.FC<ContributionChartProps> = ({ data, title = 'Contribution Activity' }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No contribution data available</Text>
        </View>
      </View>
    );
  }

  const recentData = data.slice(-8); // Last 8 weeks
  const maxValue = Math.max(...recentData.map(item => item.total));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        {recentData.map((item, index) => (
          <SimpleBar
            key={index}
            value={item.total}
            maxValue={maxValue}
            color="#0366d6"
            label={`W${index + 1}`}
          />
        ))}
      </View>
    </View>
  );
};

export const RepositoryStarsChart: React.FC<RepositoryStatsProps> = ({ repositories, title = 'Top Repositories by Stars' }) => {
  const topRepos = repositories
    .filter(repo => repo.stargazers_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  if (topRepos.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No starred repositories</Text>
        </View>
      </View>
    );
  }

  const maxStars = Math.max(...topRepos.map(repo => repo.stargazers_count));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        {topRepos.map((repo, index) => (
          <SimpleBar
            key={repo.name}
            value={repo.stargazers_count}
            maxValue={maxStars}
            color={CHART_COLORS[index % CHART_COLORS.length]}
            label={repo.name.length > 15 ? `${repo.name.substring(0, 15)}...` : repo.name}
          />
        ))}
      </View>
    </View>
  );
};

export const RepositoryForksChart: React.FC<RepositoryStatsProps> = ({ repositories, title = 'Top Repositories by Forks' }) => {
  const topRepos = repositories
    .filter(repo => repo.forks_count > 0)
    .sort((a, b) => b.forks_count - a.forks_count)
    .slice(0, 5);

  if (topRepos.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No forked repositories</Text>
        </View>
      </View>
    );
  }

  const maxForks = Math.max(...topRepos.map(repo => repo.forks_count));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        {topRepos.map((repo, index) => (
          <SimpleBar
            key={repo.name}
            value={repo.forks_count}
            maxValue={maxForks}
            color={CHART_COLORS[index % CHART_COLORS.length]}
            label={repo.name.length > 15 ? `${repo.name.substring(0, 15)}...` : repo.name}
          />
        ))}
      </View>
    </View>
  );
};

// Contribution Heatmap Component (simplified version)
interface ContributionHeatmapProps {
  contributions: Array<{
    date: string;
    count: number;
  }>;
  title?: string;
}

export const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({ 
  contributions, 
  title = 'Contribution Activity' 
}) => {
  // Group contributions by week (simplified)
  const weeks = [];
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7));
  }

  const getIntensityColor = (count: number): string => {
    if (count === 0) return '#ebedf0';
    if (count <= 3) return '#9be9a8';
    if (count <= 6) return '#40c463';
    if (count <= 9) return '#30a14e';
    return '#216e39';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.heatmapContainer}>
        {weeks.slice(-12).map((week, weekIndex) => (
          <View key={weekIndex} style={styles.heatmapWeek}>
            {week.map((day, dayIndex) => (
              <View
                key={`${weekIndex}-${dayIndex}`}
                style={[
                  styles.heatmapDay,
                  { backgroundColor: getIntensityColor(day.count) }
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.heatmapLegend}>
        <Text style={styles.legendText}>Less</Text>
        {[0, 1, 3, 6, 9].map((count, index) => (
          <View
            key={index}
            style={[
              styles.legendSquare,
              { backgroundColor: getIntensityColor(count) }
            ]}
          />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#24292e',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    paddingVertical: 8,
  },
  languageList: {
    paddingVertical: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  languageText: {
    fontSize: 14,
    color: '#24292e',
    flex: 1,
  },
  percentageText: {
    fontSize: 14,
    color: '#586069',
    fontWeight: '500',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#586069',
    width: 60,
  },
  barTrack: {
    flex: 1,
    height: 20,
    backgroundColor: '#f6f8fa',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    fontSize: 12,
    color: '#24292e',
    fontWeight: '500',
    width: 40,
    textAlign: 'right',
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#959da5',
    fontStyle: 'italic',
  },
  heatmapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heatmapWeek: {
    flexDirection: 'column',
    marginRight: 2,
  },
  heatmapDay: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginBottom: 2,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendText: {
    fontSize: 12,
    color: '#586069',
    marginHorizontal: 8,
  },
  legendSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginHorizontal: 1,
  },
});