import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  loginWithGitHub: async (code: string) => {
    const response = await api.get(`/auth/github/callback?code=${code}`);
    return response.data;
  },
};

// Code Review API
export const reviewAPI = {
  submitReview: async (code: string, language: string, context?: string) => {
    const response = await api.post('/review/analyze', {
      code,
      language,
      context,
    });
    return response.data;
  },
};

// GitHub API
export const githubAPI = {
  getRepository: async (owner: string, repo: string) => {
    const response = await api.get(`/github/repos/${owner}/${repo}`);
    return response.data;
  },

  getPullRequest: async (owner: string, repo: string, pullNumber: number) => {
    const response = await api.get(
      `/github/repos/${owner}/${repo}/pulls/${pullNumber}`
    );
    return response.data;
  },

  createReviewComment: async (
    owner: string,
    repo: string,
    pullNumber: number,
    commitId: string,
    path: string,
    body: string,
    line: number
  ) => {
    const response = await api.post(
      `/github/repos/${owner}/${repo}/pulls/${pullNumber}/comments`,
      {
        commit_id: commitId,
        path,
        body,
        line,
      }
    );
    return response.data;
  },
};

export default api; 