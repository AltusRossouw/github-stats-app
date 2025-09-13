import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { gql } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// GraphQL queries for advanced GitHub data
export const GET_USER_CONTRIBUTIONS = gql`
  query GetUserContributions($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              weekday
            }
          }
        }
      }
    }
  }
`;

export const GET_USER_REPOSITORIES_DETAILED = gql`
  query GetUserRepositoriesDetailed($username: String!, $first: Int!) {
    user(login: $username) {
      repositories(first: $first, orderBy: {field: STARGAZERS, direction: DESC}) {
        totalCount
        nodes {
          name
          description
          stargazerCount
          forkCount
          url
          createdAt
          updatedAt
          primaryLanguage {
            name
            color
          }
          languages(first: 10) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
          pullRequests {
            totalCount
          }
          issues {
            totalCount
          }
          releases {
            totalCount
          }
          collaborators {
            totalCount
          }
        }
      }
    }
  }
`;

export const GET_USER_FOLLOWERS_FOLLOWING = gql`
  query GetUserFollowersFollowing($username: String!) {
    user(login: $username) {
      followers {
        totalCount
      }
      following {
        totalCount
      }
      starredRepositories {
        totalCount
      }
      watching {
        totalCount
      }
    }
  }
`;

export const GET_USER_ORGANIZATIONS = gql`
  query GetUserOrganizations($username: String!) {
    user(login: $username) {
      organizations(first: 10) {
        nodes {
          login
          name
          description
          avatarUrl
          websiteUrl
        }
      }
    }
  }
`;

class GitHubGraphQLService {
  private client: any;

  constructor() {
    const httpLink = createHttpLink({
      uri: 'https://api.github.com/graphql',
    });

    const authLink = setContext(async (_, { headers }) => {
      try {
        const token = await AsyncStorage.getItem('github_token');
        return {
          headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
          },
        };
      } catch (error) {
        console.warn('Failed to get auth token for GraphQL:', error);
        return { headers };
      }
    });

    const errorLink = onError((errorResponse) => {
      const { graphQLErrors, networkError } = errorResponse as any;
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }: any) => {
          console.error(
            `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
          );
        });
      }

      if (networkError) {
        console.error(`Network error: ${networkError}`);
      }
    });

    this.client = new ApolloClient({
      link: from([errorLink, authLink, httpLink]),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          errorPolicy: 'all',
        },
        query: {
          errorPolicy: 'all',
        },
      },
    });
  }

  public async getUserContributions(username: string, yearback: number = 1) {
    const to = new Date();
    const from = new Date();
    from.setFullYear(to.getFullYear() - yearback);

    try {
      const result = await this.client.query({
        query: GET_USER_CONTRIBUTIONS,
        variables: {
          username,
          from: from.toISOString(),
          to: to.toISOString(),
        },
        fetchPolicy: 'cache-first',
      });

      return result.data;
    } catch (error) {
      console.error('Failed to get user contributions:', error);
      throw error;
    }
  }

  public async getUserRepositoriesDetailed(username: string, first: number = 100) {
    try {
      const result = await this.client.query({
        query: GET_USER_REPOSITORIES_DETAILED,
        variables: {
          username,
          first,
        },
        fetchPolicy: 'cache-first',
      });

      return result.data;
    } catch (error) {
      console.error('Failed to get detailed repositories:', error);
      throw error;
    }
  }

  public async getUserSocialStats(username: string) {
    try {
      const result = await this.client.query({
        query: GET_USER_FOLLOWERS_FOLLOWING,
        variables: {
          username,
        },
        fetchPolicy: 'cache-first',
      });

      return result.data;
    } catch (error) {
      console.error('Failed to get user social stats:', error);
      throw error;
    }
  }

  public async getUserOrganizations(username: string) {
    try {
      const result = await this.client.query({
        query: GET_USER_ORGANIZATIONS,
        variables: {
          username,
        },
        fetchPolicy: 'cache-first',
      });

      return result.data;
    } catch (error) {
      console.error('Failed to get user organizations:', error);
      throw error;
    }
  }

  public clearCache() {
    this.client.clearStore();
  }
}

export default new GitHubGraphQLService();