import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface EnhancedAnalyticsProps {
  profile: any;
  repositories: any[];
  languages: { [key: string]: number };
  contributionData?: any;
}

// Enhanced color palette
const LANGUAGE_COLORS: { [key: string]: string } = {
  'TypeScript': '#3178c6',
  'JavaScript': '#f1e05a',
  'Python': '#3572A5',
  'Java': '#b07219',
  'C++': '#f34b7d',
  'C': '#555555',
  'Swift': '#fa7343',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'PHP': '#4F5D95',
  'Ruby': '#701516',
  'C#': '#239120',
  'HTML': '#e34c26',
  'CSS': '#1572B6',
  'Jupyter Notebook': '#DA5B0B',
  'Shell': '#89e051',
  'Objective-C': '#438eff',
  'Kotlin': '#A97BFF',
  'Dart': '#00B4AB',
  'Scala': '#c22d40',
};

const CircularProgress: React.FC<{
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showText?: boolean;
  label?: string;
}> = ({
  value,
  maxValue = 100,
  size = 80,
  strokeWidth = 8,
  color = '#ff6b35',
  backgroundColor = '#2d3748',
  showText = true,
  label
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / maxValue) * 100, 100);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <View style={styles.circularProgress}>
        {/* Background circle */}
        <View 
          style={[
            styles.circularRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor,
            }
          ]}
        />
        {/* Progress circle - simplified for React Native */}
        <View 
          style={[
            styles.circularRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderTopColor: percentage > 75 ? color : backgroundColor,
              borderRightColor: percentage > 50 ? color : backgroundColor,
              borderBottomColor: percentage > 25 ? color : backgroundColor,
              borderLeftColor: percentage > 0 ? color : backgroundColor,
              position: 'absolute',
            }
          ]}
        />
        {showText && (
          <View style={styles.circularText}>
            <Text style={styles.circularValue}>{value}</Text>
            {label && <Text style={styles.circularLabel}>{label}</Text>}
          </View>
        )}
      </View>
    </View>
  );
};

const LanguageBar: React.FC<{ languages: { [key: string]: number } }> = ({ languages }) => {
  const sortedLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);
  
  const totalBytes = sortedLanguages.reduce((sum, [, bytes]) => sum + bytes, 0);
  const barWidth = width - 80; // Account for padding

  if (sortedLanguages.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No language data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.languageBarContainer}>
      <Text style={styles.sectionTitle}>Most Used Languages</Text>
      
      {/* Horizontal bar */}
      <View style={styles.horizontalBar}>
        {sortedLanguages.map(([language, bytes]) => {
          const percentage = (bytes / totalBytes) * 100;
          const segmentWidth = (percentage / 100) * barWidth;
          const color = LANGUAGE_COLORS[language] || '#6b7280';
          
          return (
            <View
              key={language}
              style={[
                styles.barSegment,
                {
                  width: segmentWidth,
                  backgroundColor: color,
                }
              ]}
            />
          );
        })}
      </View>

      {/* Language legend */}
      <View style={styles.languageLegend}>
        {sortedLanguages.map(([language, bytes]) => {
          const percentage = ((bytes / totalBytes) * 100).toFixed(2);
          const color = LANGUAGE_COLORS[language] || '#6b7280';
          
          return (
            <View key={language} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>
                {language} {percentage}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const StatsGrid: React.FC<{ profile: any; repositories: any[] }> = ({ profile, repositories }) => {
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
  const currentYear = new Date().getFullYear();
  
  // Mock contribution data - in a real app, you'd get this from GitHub API
  const totalContributions = Math.floor(Math.random() * 2000) + 500;
  const currentStreak = Math.floor(Math.random() * 30) + 1;
  const longestStreak = Math.floor(Math.random() * 100) + 20;

  return (
    <View style={styles.statsContainer}>
      {/* Contribution Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalContributions.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Contributions</Text>
            <Text style={styles.statSubtext}>Feb 1, 2016 - Present</Text>
          </View>
          
          <View style={styles.statItem}>
            <CircularProgress 
              value={currentStreak} 
              maxValue={30}
              size={60}
              strokeWidth={6}
              color="#ff6b35"
              label="Current Streak"
            />
            <Text style={styles.streakDate}>Sep 7 - Sep 13</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{longestStreak}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
            <Text style={styles.statSubtext}>Oct 12, 2023 - Oct 20, 2023</Text>
          </View>
        </View>
      </View>

      {/* GitHub Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>{profile.name || profile.login}' GitHub Stats</Text>
        
        <View style={styles.githubStats}>
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statText}>Total Stars Earned:</Text>
            <Text style={styles.statNumber}>{totalStars}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>🔄</Text>
            <Text style={styles.statText}>Total Commits ({currentYear}):</Text>
            <Text style={styles.statNumber}>{Math.floor(Math.random() * 500) + 50}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>🔀</Text>
            <Text style={styles.statText}>Total PRs:</Text>
            <Text style={styles.statNumber}>{Math.floor(Math.random() * 100) + 10}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>🐛</Text>
            <Text style={styles.statText}>Total Issues:</Text>
            <Text style={styles.statNumber}>{Math.floor(Math.random() * 50)}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>💻</Text>
            <Text style={styles.statText}>Contributed to (last year):</Text>
            <Text style={styles.statNumber}>{Math.floor(Math.random() * 20) + 5}</Text>
          </View>
        </View>

        {/* Grade indicator */}
        <View style={styles.gradeContainer}>
          <CircularProgress 
            value={85} 
            maxValue={100}
            size={60}
            strokeWidth={6}
            color="#4ade80"
            showText={false}
          />
          <Text style={styles.gradeText}>B+</Text>
        </View>
      </View>
    </View>
  );
};

export const EnhancedAnalytics: React.FC<EnhancedAnalyticsProps> = ({
  profile,
  repositories,
  languages,
  contributionData
}) => {
  return (
    <View style={styles.container}>
      <LanguageBar languages={languages} />
      <StatsGrid profile={profile} repositories={repositories} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b23',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  
  // Language Bar Styles
  languageBarContainer: {
    backgroundColor: '#2d3748',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  horizontalBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  barSegment: {
    height: '100%',
  },
  languageLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#e2e8f0',
  },

  // Stats Container
  statsContainer: {
    gap: 16,
  },
  statsCard: {
    backgroundColor: '#2d3748',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 14,
    color: '#a0aec0',
    textAlign: 'center',
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    marginTop: 2,
  },
  streakDate: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    marginTop: 8,
  },

  // Circular Progress
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgress: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circularRing: {
    borderStyle: 'solid',
  },
  circularText: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  circularLabel: {
    fontSize: 10,
    color: '#a0aec0',
    textAlign: 'center',
  },

  // GitHub Stats
  githubStats: {
    marginVertical: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4a5568',
  },
  statIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  statText: {
    flex: 1,
    fontSize: 14,
    color: '#e2e8f0',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    minWidth: 40,
    textAlign: 'right',
  },

  // Grade
  gradeContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  gradeText: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // No Data
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#718096',
    fontStyle: 'italic',
  },
});