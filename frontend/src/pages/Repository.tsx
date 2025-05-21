import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { githubAPI } from '../services/api';

interface PullRequest {
  number: number;
  title: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  state: string;
}

interface Repository {
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
}

export default function Repository() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();

  const [repository, setRepository] = useState<Repository | null>(null);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!owner || !repo) return;

      try {
        setLoading(true);
        const repoData = await githubAPI.getRepository(owner, repo);
        setRepository(repoData.data);

        // Fetch pull requests
        const { data: prData } = await githubAPI.getPullRequest(owner, repo, 1);
        setPullRequests(prData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load repository data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [owner, repo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!repository) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{repository.name}</h2>
            <p className="mt-1 text-sm text-gray-500">{repository.description}</p>
          </div>
          <div className="flex space-x-4">
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-900">
                {repository.stargazers_count}
              </span>
              <span className="block text-sm text-gray-500">Stars</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-900">
                {repository.forks_count}
              </span>
              <span className="block text-sm text-gray-500">Forks</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-900">
                {repository.open_issues_count}
              </span>
              <span className="block text-sm text-gray-500">Issues</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pull Requests</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pullRequests.map((pr) => (
                <tr key={pr.number}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{pr.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pr.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={pr.user.avatar_url}
                        alt={pr.user.login}
                      />
                      <span className="ml-2 text-sm text-gray-500">
                        {pr.user.login}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pr.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pr.state === 'open'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {pr.state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 