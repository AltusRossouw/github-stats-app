import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';

const { width } = Dimensions.get('window');

interface EnhancedAnalyticsProps {
  profile: any;
  repositories: any[];
  languages: { [key: string]: number };
  contributionData?: any;
}

// Enhanced color palette matching IDE themes
const LANGUAGE_COLORS: { [key: string]: string } = {
  'TypeScript': '#3178c6',      // Blue for TypeScript
  'JavaScript': '#f1e05a',      // Yellow for JavaScript  
  'Python': '#3572A5',          // Green for Python
  'Java': '#b07219',
  'C++': '#f34b7d',            // Pink for C++
  'C': '#555555',
  'Swift': '#fa7343',          // Orange for Swift
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'PHP': '#4F5D95',
  'Ruby': '#701516',
  'C#': '#239120',
  'HTML': '#e34c26',
  'CSS': '#1572B6',
  'Jupyter Notebook': '#DA5B0B', // Orange for Jupyter
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
      <Text style={styles.cardTitle}>💻 Most Used Languages</Text>
      
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

      {/* Language legend with progress bars */}
      <View style={styles.languageLegend}>
        {sortedLanguages.map(([language, bytes]) => {
          const percentage = ((bytes / totalBytes) * 100).toFixed(2);
          const color = LANGUAGE_COLORS[language] || '#6b7280';
          
          return (
            <View key={language} style={styles.languageProgressItem}>
              <View style={styles.languageHeader}>
                <View style={styles.languageInfo}>
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text style={styles.languageName}>{language}</Text>
                </View>
                <Text style={styles.languagePercentage}>{percentage}%</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View 
                  style={[
                    styles.progressBarFill,
                    { 
                      width: `${Math.min(parseFloat(percentage), 100)}%` as any,
                      backgroundColor: color,
                    }
                  ]}
                />
              </View>
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
  
  // Specific stats from the brief
  const totalContributions = 1417; // Feb 1, 2016 - Present
  const currentStreak = 7; // Sep 7 - Sep 13
  const longestStreak = 9; // Oct 12, 2023 - Oct 20, 2023
  const totalCommits2025 = 128;
  const totalPRs = 1;
  const totalIssues = 0;
  const contributedReposLastYear = 0;

  return (
    <View style={styles.statsContainer}>
      {/* Activity Metrics Card */}
      <View style={styles.activityCard}>
        <Text style={styles.cardTitle}>📊 Activity Metrics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalContributions.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Contributions</Text>
            <Text style={styles.statSubtext}>Feb 1, 2016 - Present</Text>
          </View>
          
          <View style={styles.statItem}>
            <CircularProgress 
              value={currentStreak} 
              maxValue={10}
              size={60}
              strokeWidth={6}
              color="#ff6b35"
              showText={true}
            />
            <Text style={styles.streakLabel}>🔥 Current Streak</Text>
            <Text style={styles.streakDate}>Sep 7 - Sep 13</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{longestStreak}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
            <Text style={styles.statSubtext}>Oct 12, 2023 - Oct 20, 2023</Text>
          </View>
        </View>
      </View>

      {/* GitHub Stats Summary Card */}
      <View style={styles.githubStatsCard}>
        <Text style={styles.cardTitle}>📈 GitHub Stats Summary</Text>
        
        <View style={styles.githubStats}>
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statText}>Total Stars Earned:</Text>
            <Text style={styles.statNumber}>{totalStars}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>�</Text>
            <Text style={styles.statText}>Total Commits (2025):</Text>
            <Text style={styles.statNumber}>{totalCommits2025}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>🔀</Text>
            <Text style={styles.statText}>Total Pull Requests (PRs):</Text>
            <Text style={styles.statNumber}>{totalPRs}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>🐛</Text>
            <Text style={styles.statText}>Total Issues Created:</Text>
            <Text style={styles.statNumber}>{totalIssues}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>🏗️</Text>
            <Text style={styles.statText}>Repositories Contributed to (last year):</Text>
            <Text style={styles.statNumber}>{contributedReposLastYear}</Text>
          </View>
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
      {/* Header with username and avatar */}
      <View style={styles.profileHeader}>
        <Image 
          source={{ uri: profile.avatar_url }} 
          style={styles.headerAvatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{profile.name || profile.login}</Text>
          <Text style={styles.headerUsername}>@{profile.login}</Text>
          <Text style={styles.analysisPeriod}>Analysis Period: Feb 1, 2016 - Present</Text>
        </View>
      </View>
      
      <LanguageBar languages={languages} />
      <StatsGrid profile={profile} repositories={repositories} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  
  // Profile Header Styles
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  headerUsername: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 8,
  },
  analysisPeriod: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  
  // Language Bar Styles
  languageBarContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
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
    gap: 12,
  },
  languageProgressItem: {
    marginBottom: 12,
  },
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  languagePercentage: {
    fontSize: 14,
    color: '#495057',
    fontWeight: 'bold',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
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
    color: '#495057',
  },

  // Stats Container
  statsContainer: {
    gap: 16,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  githubStatsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
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
    color: '#212529',
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 4,
  },
  streakLabel: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  statSubtext: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 2,
  },
  streakDate: {
    fontSize: 12,
    color: '#6c757d',
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
    color: '#212529',
    textAlign: 'center',
  },
  circularLabel: {
    fontSize: 10,
    color: '#6c757d',
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
    borderBottomColor: '#e9ecef',
  },
  statIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  statText: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
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
    color: '#212529',
  },

  // No Data
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});