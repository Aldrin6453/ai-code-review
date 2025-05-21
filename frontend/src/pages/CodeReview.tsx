import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  startReview,
  reviewSuccess,
  reviewFailure,
} from '../store/slices/reviewSlice';
import { reviewAPI } from '../services/api';

interface Review {
  id: string;
  code: string;
  language: string;
  review: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}

interface ReviewState {
  currentReview: Review | null;
  loading: boolean;
}

const languages = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'Go',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
];

export default function CodeReview() {
  const dispatch = useDispatch();
  const { currentReview, loading } = useSelector(
    (state: RootState) => state.review as ReviewState
  );

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(languages[0]);
  const [context, setContext] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      dispatch(startReview({ code, language }));
      const { review } = await reviewAPI.submitReview(code, language, context);
      dispatch(reviewSuccess({ review }));
    } catch (error) {
      dispatch(reviewFailure(error instanceof Error ? error.message : 'Review failed'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Code Review</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-700"
            >
              Programming Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700"
            >
              Code
            </label>
            <div className="mt-1">
              <textarea
                id="code"
                rows={10}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md font-mono"
                placeholder="Paste your code here..."
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="context"
              className="block text-sm font-medium text-gray-700"
            >
              Additional Context (Optional)
            </label>
            <div className="mt-1">
              <textarea
                id="context"
                rows={3}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Add any additional context about the code..."
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>

      {currentReview && currentReview.status === 'completed' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Review Results</h3>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap">{currentReview.review}</pre>
          </div>
        </div>
      )}
    </div>
  );
} 