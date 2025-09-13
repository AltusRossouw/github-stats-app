import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { GitHubProfileStats } from '../types/github';
import GitHubAPIService from '../services/githubAPI';
import GitHubGraphQLService from '../services/githubGraphQL';
import {
  LanguagePieChart,
  ContributionChart,
  RepositoryStarsChart,
  RepositoryForksChart,
  ContributionHeatmap,
} from '../components/ChartsSimple';
import { EnhancedAnalytics } from '../components/EnhancedAnalytics';
import { DEMO_USER, DEMO_REPOSITORIES, DEMO_LANGUAGE_STATS } from '../data/demoData';

interface AnalyticsScreenProps {
  username: string;
  onBackPress: () => void;
}

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  username,
  onBackPress,
}) => {
  const [profileData, setProfileData] = useState<GitHubProfileStats | null>(null);
  const [contributionData, setContributionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDemoData();
  }, [username]);

  const loadDemoData = () => {
    setLoading(true);
    setError(null);

    // Use demo data instead of fetching from API
    const demoProfileData: GitHubProfileStats = {
      user: DEMO_USER,
      repositories: DEMO_REPOSITORIES,
      languageStats: DEMO_LANGUAGE_STATS,
      totalStars: DEMO_REPOSITORIES.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      totalForks: DEMO_REPOSITORIES.reduce((sum, repo) => sum + repo.forks_count, 0),
      contributionData: [],
      recentActivity: [],
      topRepositories: DEMO_REPOSITORIES.slice(0, 5),
    };

    setProfileData(demoProfileData);
    setContributionData({
      totalContributions: 1417,
      currentStreak: 7,
      longestStreak: 15,
    });
    setLoading(false);
  };

  const renderOverviewStats = () => {
    if (!profileData) return null;

    const { user, totalStars, totalForks, repositories } = profileData;
    const totalCommits = repositories.reduce((sum, repo) => sum + (repo.size || 0), 0);
    const avgStarsPerRepo = repositories.length > 0 ? (totalStars / repositories.length).toFixed(1) : '0';

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{repositories.length}</Text>
            <Text style={styles.statLabel}>Repositories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalStars}</Text>
            <Text style={styles.statLabel}>Total Stars</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalForks}</Text>
            <Text style={styles.statLabel}>Total Forks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{avgStarsPerRepo}</Text>
            <Text style={styles.statLabel}>Avg Stars/Repo</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderLanguageAnalysis = () => {
    if (!profileData || Object.keys(profileData.languageStats).length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <LanguagePieChart
          data={profileData.languageStats}
          title="Programming Languages"
        />
      </View>
    );
  };

  const renderRepositoryCharts = () => {
    if (!profileData || profileData.repositories.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <RepositoryStarsChart
          repositories={profileData.repositories}
          title="Most Starred Repositories"
        />
        <View style={styles.chartSpacing} />
        <RepositoryForksChart
          repositories={profileData.repositories}
          title="Most Forked Repositories"
        />
      </View>
    );
  };

  const renderContributionAnalysis = () => {
    if (!contributionData?.user?.contributionsCollection) {
      return null;
    }

    const { contributionsCollection } = contributionData.user;
    const { contributionCalendar } = contributionsCollection;

    // Convert GraphQL contribution data to chart format
    const contributionDays = contributionCalendar.weeks.flatMap((week: any) =>
      week.contributionDays.map((day: any) => ({
        date: day.date,
        count: day.contributionCount,
      }))
    );

    return (
      <View style={styles.section}>
        <ContributionHeatmap
          contributions={contributionDays}
          title="Contribution Activity (Last Year)"
        />
        
        <View style={styles.contributionStats}>
          <Text style={styles.sectionTitle}>Contribution Summary</Text>
          <View style={styles.contributionStatsGrid}>
            <View style={styles.contributionStatItem}>
              <Text style={styles.contributionStatValue}>
                {contributionsCollection.totalCommitContributions}
              </Text>
              <Text style={styles.contributionStatLabel}>Commits</Text>
            </View>
            <View style={styles.contributionStatItem}>
              <Text style={styles.contributionStatValue}>
                {contributionsCollection.totalPullRequestContributions}
              </Text>
              <Text style={styles.contributionStatLabel}>Pull Requests</Text>
            </View>
            <View style={styles.contributionStatItem}>
              <Text style={styles.contributionStatValue}>
                {contributionsCollection.totalIssueContributions}
              </Text>
              <Text style={styles.contributionStatLabel}>Issues</Text>
            </View>
            <View style={styles.contributionStatItem}>
              <Text style={styles.contributionStatValue}>
                {contributionsCollection.totalPullRequestReviewContributions}
              </Text>
              <Text style={styles.contributionStatLabel}>PR Reviews</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderProductivityInsights = () => {
    if (!profileData) return null;

    const { repositories, recentActivity } = profileData;
    
    // Calculate insights
    const reposWithIssues = repositories.filter(repo => repo.has_issues).length;
    const reposWithWiki = repositories.filter(repo => repo.has_wiki).length;
    const reposWithPages = repositories.filter(repo => repo.has_pages).length;
    const privateRepos = repositories.filter(repo => repo.private).length;
    
    const mostUsedLanguage = Object.entries(profileData.languageStats)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    const avgRepoAge = repositories.length > 0 
      ? repositories.reduce((sum, repo) => {
          const age = (Date.now() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return sum + age;
        }, 0) / repositories.length
      : 0;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Productivity Insights</Text>
        
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Development Patterns</Text>
          <Text style={styles.insightText}>
            Most used language: <Text style={styles.insightHighlight}>{mostUsedLanguage}</Text>
          </Text>
          <Text style={styles.insightText}>
            Avg repository age: <Text style={styles.insightHighlight}>{Math.round(avgRepoAge)} days</Text>
          </Text>
          <Text style={styles.insightText}>
            Repositories with documentation: <Text style={styles.insightHighlight}>{reposWithWiki}</Text>
          </Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Project Management</Text>
          <Text style={styles.insightText}>
            Repositories with issue tracking: <Text style={styles.insightHighlight}>{reposWithIssues}</Text>
          </Text>
          <Text style={styles.insightText}>
            Repositories with GitHub Pages: <Text style={styles.insightHighlight}>{reposWithPages}</Text>
          </Text>
          <Text style={styles.insightText}>
            Recent activity events: <Text style={styles.insightHighlight}>{recentActivity.length}</Text>
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0366d6" />
        <Text style={styles.loadingText}>Loading detailed analytics...</Text>
      </View>
    );
  }

  if (error || !profileData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load analytics</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDemoData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonSmall} onPress={onBackPress}>
          <Text style={styles.backButtonSmallText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics for @{username}</Text>
      </View>

      <EnhancedAnalytics
        profile={profileData.user}
        repositories={profileData.repositories}
        languages={profileData.languageStats}
        contributionData={contributionData}
      />
      
      {renderOverviewStats()}
      {renderRepositoryCharts()}
      {renderContributionAnalysis()}
      {renderProductivityInsights()}

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  backButtonSmall: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonSmallText: {
    color: '#0366d6',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#24292e',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24292e',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#24292e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#586069',
    textAlign: 'center',
  },
  chartSpacing: {
    height: 16,
  },
  contributionStats: {
    marginTop: 20,
  },
  contributionStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contributionStatItem: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  contributionStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  contributionStatLabel: {
    fontSize: 12,
    color: '#586069',
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24292e',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#586069',
    marginBottom: 8,
    lineHeight: 20,
  },
  insightHighlight: {
    fontWeight: '600',
    color: '#0366d6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#586069',
  },
  errorText: {
    fontSize: 16,
    color: '#d73a49',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0366d6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#f6f8fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  backButtonText: {
    color: '#24292e',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    height: 40,
  },
});

export default AnalyticsScreen;