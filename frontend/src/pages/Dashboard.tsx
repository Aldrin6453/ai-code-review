import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { RootState } from '../store';

interface Review {
  id: string;
  code: string;
  language: string;
  review: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}

interface ReviewState {
  reviews: Review[];
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Code Review Statistics',
    },
  },
};

export default function Dashboard() {
  const { reviews } = useSelector((state: RootState) => state.review as ReviewState);
  const { user } = useSelector((state: RootState) => state.auth);

  // Calculate statistics
  const totalReviews = reviews.length;
  const completedReviews = reviews.filter((r: Review) => r.status === 'completed').length;
  const failedReviews = reviews.filter((r: Review) => r.status === 'failed').length;

  // Prepare chart data
  const labels = ['Total', 'Completed', 'Failed'];
  const data = {
    labels,
    datasets: [
      {
        label: 'Code Reviews',
        data: [totalReviews, completedReviews, failedReviews],
        backgroundColor: [
          'rgba(53, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome back, {user?.username}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-primary-900">Total Reviews</h3>
            <p className="text-3xl font-bold text-primary-600">{totalReviews}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-900">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{completedReviews}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-900">Failed</h3>
            <p className="text-3xl font-bold text-red-600">{failedReviews}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-64">
          <Bar options={options} data={data} />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Reviews</h2>
          <Link
            to="/review"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            New Review
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.slice(0, 5).map((review: Review) => (
                <tr key={review.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {review.language}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        review.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : review.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {review.status}
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