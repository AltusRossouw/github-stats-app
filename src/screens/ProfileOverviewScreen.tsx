import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { GitHubProfileStats } from '../types/github';
import GitHubAPIService from '../services/githubAPI';

interface ProfileOverviewScreenProps {
  username: string;
  onBackPress: () => void;
  onViewAnalytics?: () => void;
}

const { width } = Dimensions.get('window');

const ProfileOverviewScreen: React.FC<ProfileOverviewScreenProps> = ({
  username,
  onBackPress,
  onViewAnalytics,
}) => {
  const [profileData, setProfileData] = useState<GitHubProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfileData();
  }, [username]);

  const loadProfileData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await GitHubAPIService.getComprehensiveProfile(username);
      setProfileData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile data');
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const openURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  const renderStatCard = (title: string, value: string | number, subtitle?: string) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{formatNumber(Number(value))}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderTopRepositories = () => {
    if (!profileData?.topRepositories.length) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Repositories</Text>
        {profileData.topRepositories.slice(0, 5).map((repo) => (
          <TouchableOpacity
            key={repo.id}
            style={styles.repoCard}
            onPress={() => openURL(repo.html_url)}
          >
            <View style={styles.repoHeader}>
              <Text style={styles.repoName}>{repo.name}</Text>
              <View style={styles.repoStats}>
                <Text style={styles.repoStat}>⭐ {repo.stargazers_count}</Text>
                <Text style={styles.repoStat}>🍴 {repo.forks_count}</Text>
              </View>
            </View>
            {repo.description && (
              <Text style={styles.repoDescription} numberOfLines={2}>
                {repo.description}
              </Text>
            )}
            <View style={styles.repoFooter}>
              {repo.language && (
                <View style={styles.languageTag}>
                  <Text style={styles.languageText}>{repo.language}</Text>
                </View>
              )}
              <Text style={styles.repoDate}>
                Updated {formatDate(repo.updated_at)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0366d6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !profileData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfileData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { user } = profileData;
  const isDemoMode = user.bio?.includes('Rate limit exceeded') || user.name?.includes('Demo Mode');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonSmall} onPress={onBackPress}>
          <Text style={styles.backButtonSmallText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            📊 Demo Mode Active - Rate limit exceeded. Showing sample data to demonstrate app features.
          </Text>
        </View>
      )}

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user.name || user.login}</Text>
          <Text style={styles.username}>@{user.login}</Text>
          {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
          
          <View style={styles.profileDetails}>
            {user.company && (
              <Text style={styles.detailText}>🏢 {user.company}</Text>
            )}
            {user.location && (
              <Text style={styles.detailText}>📍 {user.location}</Text>
            )}
            {user.email && (
              <Text style={styles.detailText}>📧 {user.email}</Text>
            )}
            {user.blog && (
              <TouchableOpacity onPress={() => openURL(user.blog!)}>
                <Text style={[styles.detailText, styles.linkText]}>🔗 {user.blog}</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.detailText}>
              📅 Joined {formatDate(user.created_at)}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {renderStatCard('Public Repos', user.public_repos)}
        {renderStatCard('Total Stars', profileData.totalStars)}
        {renderStatCard('Total Forks', profileData.totalForks)}
        {renderStatCard('Followers', user.followers)}
        {renderStatCard('Following', user.following)}
        {renderStatCard('Public Gists', user.public_gists)}
      </View>

      {/* Top Repositories */}
      {renderTopRepositories()}

      {/* Language Statistics Preview */}
      {Object.keys(profileData.languageStats).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Languages</Text>
          <View style={styles.languagePreview}>
            {Object.entries(profileData.languageStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([language, bytes]) => (
                <View key={language} style={styles.languageItem}>
                  <Text style={styles.languageName}>{language}</Text>
                  <Text style={styles.languageBytes}>
                    {(bytes / 1024).toFixed(1)} KB
                  </Text>
                </View>
              ))}
          </View>
        </View>
      )}

      {/* Recent Activity Preview */}
      {profileData.recentActivity.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {profileData.recentActivity.slice(0, 3).map((event) => (
            <View key={event.id} style={styles.activityItem}>
              <Text style={styles.activityType}>{event.type}</Text>
              <Text style={styles.activityRepo}>{event.repo.name}</Text>
              <Text style={styles.activityDate}>
                {formatDate(event.created_at)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        {onViewAnalytics && (
          <TouchableOpacity
            style={styles.analyticsButton}
            onPress={onViewAnalytics}
          >
            <Text style={styles.analyticsButtonText}>View Detailed Analytics</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.githubButton}
          onPress={() => openURL(`https://github.com/${username}`)}
        >
          <Text style={styles.githubButtonText}>View on GitHub</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 10,
  },
  backButtonSmall: {
    alignSelf: 'flex-start',
  },
  backButtonSmallText: {
    color: '#0366d6',
    fontSize: 16,
    fontWeight: '500',
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#24292e',
    marginBottom: 4,
  },
  username: {
    fontSize: 18,
    color: '#586069',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: '#24292e',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  profileDetails: {
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#586069',
    marginBottom: 4,
  },
  linkText: {
    color: '#0366d6',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    width: (width - 60) / 3,
    margin: 5,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24292e',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#586069',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#959da5',
    marginTop: 2,
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
  repoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  repoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  repoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0366d6',
    flex: 1,
  },
  repoStats: {
    flexDirection: 'row',
    gap: 12,
  },
  repoStat: {
    fontSize: 12,
    color: '#586069',
  },
  repoDescription: {
    fontSize: 14,
    color: '#586069',
    marginBottom: 12,
    lineHeight: 20,
  },
  repoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageTag: {
    backgroundColor: '#f1f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  languageText: {
    fontSize: 12,
    color: '#0366d6',
    fontWeight: '500',
  },
  repoDate: {
    fontSize: 12,
    color: '#959da5',
  },
  languagePreview: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f6f8fa',
  },
  languageName: {
    fontSize: 14,
    color: '#24292e',
    fontWeight: '500',
  },
  languageBytes: {
    fontSize: 14,
    color: '#586069',
  },
  activityItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  activityType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#24292e',
  },
  activityRepo: {
    fontSize: 14,
    color: '#0366d6',
    marginTop: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#586069',
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  githubButton: {
    backgroundColor: '#24292e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  githubButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  analyticsButton: {
    backgroundColor: '#0366d6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  analyticsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  demoBanner: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
    marginTop: 8,
  },
  demoText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ProfileOverviewScreen;