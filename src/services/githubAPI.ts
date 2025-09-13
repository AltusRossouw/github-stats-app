import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GitHubUser,
  GitHubRepository,
  GitHubLanguageStats,
  GitHubCommitActivity,
  GitHubEvent,
  GitHubProfileStats,
  APIError,
} from '../types/github';
import { DEMO_PROFILE_STATS } from '../data/demoData';

class GitHubAPIService {
  private restClient: AxiosInstance;
  private rateLimitRemaining: number = 60;
  private rateLimitReset: number = 0;
  private authToken: string | null = null;

  constructor() {
    this.restClient = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHubProfileAnalyzer/1.0',
      },
    });

    this.setupInterceptors();
    this.loadAuthToken();
  }

  private async loadAuthToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('github_token');
      if (token) {
        this.setAuthToken(token);
      }
    } catch (error) {
      console.warn('Failed to load auth token:', error);
    }
  }

  public setAuthToken(token: string): void {
    this.authToken = token;
    this.restClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  public clearAuthToken(): void {
    this.authToken = null;
    delete this.restClient.defaults.headers.common['Authorization'];
    AsyncStorage.removeItem('github_token');
  }

  private setupInterceptors(): void {
    // Request interceptor for rate limiting
    this.restClient.interceptors.request.use(
      async (config) => {
        // Check rate limit before making request
        if (this.rateLimitRemaining <= 1 && Date.now() / 1000 < this.rateLimitReset) {
          const waitTime = (this.rateLimitReset - Date.now() / 1000) * 1000;
          console.warn(`Rate limit exceeded. Waiting ${waitTime}ms`);
          
          // If wait time is too long, throw an error instead
          if (waitTime > 60000) { // More than 1 minute
            throw new Error('Rate limit exceeded. Please try again later.');
          }
          
          await new Promise((resolve) => setTimeout(() => resolve(undefined), waitTime));
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for rate limit tracking and error handling
    this.restClient.interceptors.response.use(
      (response: AxiosResponse) => {
        // Update rate limit info
        this.rateLimitRemaining = parseInt(response.headers['x-ratelimit-remaining'] || '60');
        this.rateLimitReset = parseInt(response.headers['x-ratelimit-reset'] || '0');
        
        console.log(`Rate limit remaining: ${this.rateLimitRemaining}`);
        
        return response;
      },
      (error) => {
        if (error.response?.status === 403 && error.response?.data?.message?.includes('rate limit')) {
          const apiError: APIError = {
            message: 'GitHub API rate limit exceeded. Please try again later.',
            status: 403,
            documentation_url: error.response.data.documentation_url,
          };
          return Promise.reject(apiError);
        }
        
        if (error.response) {
          const apiError: APIError = {
            message: error.response.data.message || 'An error occurred',
            status: error.response.status,
            documentation_url: error.response.data.documentation_url,
          };
          return Promise.reject(apiError);
        }
        return Promise.reject(error);
      }
    );
  }

  public async getUser(username: string): Promise<GitHubUser> {
    const cacheKey = `user_${username}`;
    
    try {
      // Try to get from cache first
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache for 2 hours normally, or 24 hours if we're near rate limit
        const cacheTime = this.rateLimitRemaining < 10 ? 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000;
        if (Date.now() - timestamp < cacheTime) {
          console.log(`Using cached user data for ${username}`);
          return data;
        }
      }
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
    }

    try {
      const response = await this.restClient.get<GitHubUser>(`/users/${username}`);
      
      // Cache the result
      try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
          data: response.data,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn('Cache storage failed:', error);
      }
      
      return response.data;
    } catch (error: any) {
      // If we hit rate limit, try to return cached data even if expired
      if (error.status === 403) {
        try {
          const cached = await AsyncStorage.getItem(cacheKey);
          if (cached) {
            const { data } = JSON.parse(cached);
            console.log(`Using expired cached data due to rate limit for ${username}`);
            return data;
          }
        } catch (cacheError) {
          console.warn('Failed to retrieve expired cache:', cacheError);
        }
      }
      throw error;
    }
  }

  public async getUserRepositories(username: string, page: number = 1, perPage: number = 100): Promise<GitHubRepository[]> {
    const cacheKey = `repos_${username}_${page}_${perPage}`;
    
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache for 4 hours normally, or 24 hours if we're near rate limit
        const cacheTime = this.rateLimitRemaining < 10 ? 24 * 60 * 60 * 1000 : 4 * 60 * 60 * 1000;
        if (Date.now() - timestamp < cacheTime) {
          console.log(`Using cached repository data for ${username}`);
          return data;
        }
      }
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
    }

    try {
      const response = await this.restClient.get<GitHubRepository[]>(
        `/users/${username}/repos`,
        {
          params: {
            type: 'all',
            sort: 'updated',
            direction: 'desc',
            page,
            per_page: perPage,
          },
        }
      );
      
      try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
          data: response.data,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn('Cache storage failed:', error);
      }
      
      return response.data;
    } catch (error: any) {
      // If we hit rate limit, try to return cached data even if expired
      if (error.status === 403) {
        try {
          const cached = await AsyncStorage.getItem(cacheKey);
          if (cached) {
            const { data } = JSON.parse(cached);
            console.log(`Using expired cached repository data due to rate limit for ${username}`);
            return data;
          }
        } catch (cacheError) {
          console.warn('Failed to retrieve expired cache:', cacheError);
        }
      }
      throw error;
    }
  }

  public async getRepositoryLanguages(owner: string, repo: string): Promise<GitHubLanguageStats> {
    try {
      const response = await this.restClient.get<GitHubLanguageStats>(`/repos/${owner}/${repo}/languages`);
      return response.data;
    } catch (error) {
      console.warn(`Failed to get languages for ${owner}/${repo}:`, error);
      return {};
    }
  }

  public async getRepositoryCommitActivity(owner: string, repo: string): Promise<GitHubCommitActivity[]> {
    try {
      const response = await this.restClient.get<GitHubCommitActivity[]>(`/repos/${owner}/${repo}/stats/commit_activity`);
      return response.data || [];
    } catch (error) {
      console.warn(`Failed to get commit activity for ${owner}/${repo}:`, error);
      return [];
    }
  }

  public async getUserEvents(username: string): Promise<GitHubEvent[]> {
    try {
      const response = await this.restClient.get<GitHubEvent[]>(`/users/${username}/events/public`);
      return response.data;
    } catch (error) {
      console.warn(`Failed to get events for ${username}:`, error);
      return [];
    }
  }

  public async getComprehensiveProfile(username: string): Promise<GitHubProfileStats> {
    try {
      // Get user data
      const user = await this.getUser(username);
      
      // Get all repositories
      const repositories = await this.getUserRepositories(username);
      
      // Calculate total stars and forks
      const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
      
      // Get top repositories by stars
      const topRepositories = repositories
        .filter(repo => !repo.private)
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 10);
      
      // Get language statistics
      const languageStats: GitHubLanguageStats = {};
      const languagePromises = topRepositories.map(async (repo) => {
        if (repo.language) {
          const langs = await this.getRepositoryLanguages(repo.full_name.split('/')[0], repo.name);
          Object.entries(langs).forEach(([lang, bytes]) => {
            languageStats[lang] = (languageStats[lang] || 0) + bytes;
          });
        }
      });
      
      await Promise.all(languagePromises);
      
      // Get recent activity
      const recentActivity = await this.getUserEvents(username);
      
      // Get contribution data from top repositories
      const contributionData: GitHubCommitActivity[] = [];
      const contributionPromises = topRepositories.slice(0, 5).map(async (repo) => {
        const activity = await this.getRepositoryCommitActivity(repo.full_name.split('/')[0], repo.name);
        contributionData.push(...activity);
      });
      
      await Promise.all(contributionPromises);
      
      return {
        user,
        repositories,
        totalStars,
        totalForks,
        languageStats,
        contributionData,
        recentActivity,
        topRepositories,
      };
    } catch (error: any) {
      // If we hit rate limit and no cached data is available, return demo data
      if (error.status === 403 && error.message?.includes('rate limit')) {
        console.log('Rate limit exceeded, returning demo data');
        return {
          ...DEMO_PROFILE_STATS,
          user: {
            ...DEMO_PROFILE_STATS.user,
            login: username, // Keep the requested username
            name: `${username} (Demo Mode)`,
            bio: 'Rate limit exceeded. This is demo data to showcase the app functionality.',
          }
        };
      }
      throw error;
    }
  }

  public getRateLimitStatus(): { remaining: number; reset: number } {
    return {
      remaining: this.rateLimitRemaining,
      reset: this.rateLimitReset,
    };
  }
}

export default new GitHubAPIService();