import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GitHubAPIService from '../services/githubAPI';

interface RecentSearch {
  username: string;
  timestamp: number;
}

interface UserInputScreenProps {
  onUserSelected: (username: string) => void;
}

const UserInputScreen: React.FC<UserInputScreenProps> = ({ onUserSelected }) => {
  const [username, setUsername] = useState('');
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem('recent_searches');
      if (stored) {
        const searches: RecentSearch[] = JSON.parse(stored);
        setRecentSearches(searches.slice(0, 10)); // Keep only last 10
      }
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
    }
  };

  const saveRecentSearch = async (searchedUsername: string) => {
    try {
      const newSearch: RecentSearch = {
        username: searchedUsername,
        timestamp: Date.now(),
      };

      // Remove existing entry for this username and add new one at the beginning
      const updatedSearches = [
        newSearch,
        ...recentSearches.filter(search => search.username !== searchedUsername)
      ].slice(0, 10);

      setRecentSearches(updatedSearches);
      await AsyncStorage.setItem('recent_searches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.warn('Failed to save recent search:', error);
    }
  };

  const validateUsername = (input: string): string => {
    if (!input.trim()) {
      return 'Username is required';
    }

    // GitHub username validation rules
    if (input.length > 39) {
      return 'Username cannot be longer than 39 characters';
    }

    if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(input)) {
      return 'Username may only contain alphanumeric characters or hyphens, cannot have multiple consecutive hyphens, and cannot begin or end with a hyphen';
    }

    return '';
  };

  const handleSearch = async () => {
    const trimmedUsername = username.trim();
    const error = validateUsername(trimmedUsername);
    
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError('');
    setIsLoading(true);

    try {
      // Test if user exists by making a request
      await GitHubAPIService.getUser(trimmedUsername);
      
      // If successful, save to recent searches and proceed
      await saveRecentSearch(trimmedUsername);
      onUserSelected(trimmedUsername);
    } catch (error: any) {
      if (error.status === 404) {
        Alert.alert('User Not Found', `GitHub user "${trimmedUsername}" does not exist.`);
      } else if (error.status === 403) {
        Alert.alert('Rate Limit Exceeded', 'GitHub API rate limit exceeded. Please try again later.');
      } else {
        Alert.alert('Error', 'Failed to fetch user data. Please check your internet connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentSearchPress = (searchedUsername: string) => {
    setUsername(searchedUsername);
    setValidationError('');
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem('recent_searches');
      setRecentSearches([]);
    } catch (error) {
      console.warn('Failed to clear recent searches:', error);
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const renderRecentSearch = ({ item }: { item: RecentSearch }) => (
    <TouchableOpacity
      style={styles.recentSearchItem}
      onPress={() => handleRecentSearchPress(item.username)}
    >
      <View style={styles.recentSearchContent}>
        <Text style={styles.recentSearchUsername}>{item.username}</Text>
        <Text style={styles.recentSearchTime}>{formatTimestamp(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>GitHub Profile Analyzer</Text>
            <Text style={styles.subtitle}>
              Enter a GitHub username to view comprehensive profile statistics
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>GitHub Username</Text>
            <TextInput
              style={[styles.textInput, validationError ? styles.textInputError : null]}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (validationError) setValidationError('');
              }}
              placeholder="e.g., octocat"
              placeholderTextColor="#888"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              editable={!isLoading}
            />
            {validationError ? (
              <Text style={styles.errorText}>{validationError}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.searchButton, (isLoading || !username.trim()) && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={isLoading || !username.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Analyze Profile</Text>
            )}
          </TouchableOpacity>

          {recentSearches.length > 0 && (
            <View style={styles.recentSearchesSection}>
              <View style={styles.recentSearchesHeader}>
                <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearButton}>Clear</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={recentSearches}
                renderItem={renderRecentSearch}
                keyExtractor={(item) => `${item.username}-${item.timestamp}`}
                showsVerticalScrollIndicator={false}
                style={styles.recentSearchesList}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#24292e',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#586069',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24292e',
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5da',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#24292e',
  },
  textInputError: {
    borderColor: '#d73a49',
  },
  errorText: {
    color: '#d73a49',
    fontSize: 14,
    marginTop: 4,
  },
  searchButton: {
    backgroundColor: '#0366d6',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  searchButtonDisabled: {
    backgroundColor: '#b3b3b3',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recentSearchesSection: {
    flex: 1,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#24292e',
  },
  clearButton: {
    color: '#0366d6',
    fontSize: 14,
    fontWeight: '500',
  },
  recentSearchesList: {
    flex: 1,
  },
  recentSearchItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  recentSearchContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentSearchUsername: {
    fontSize: 16,
    color: '#24292e',
    fontWeight: '500',
  },
  recentSearchTime: {
    fontSize: 14,
    color: '#586069',
  },
});

export default UserInputScreen;