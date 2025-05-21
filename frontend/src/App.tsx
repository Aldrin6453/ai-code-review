import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CodeReview from './pages/CodeReview';
import Repository from './pages/Repository';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route
                path="dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="review"
                element={
                  <PrivateRoute>
                    <CodeReview />
                  </PrivateRoute>
                }
              />
              <Route
                path="repository/:owner/:repo"
                element={
                  <PrivateRoute>
                    <Repository />
                  </PrivateRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
