import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
  currentReview: Review | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  currentReview: null,
  loading: false,
  error: null,
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    startReview: (state, action: PayloadAction<{ code: string; language: string }>) => {
      state.loading = true;
      state.error = null;
      state.currentReview = {
        id: Date.now().toString(),
        code: action.payload.code,
        language: action.payload.language,
        review: '',
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
    },
    reviewSuccess: (state, action: PayloadAction<{ review: string }>) => {
      if (state.currentReview) {
        state.currentReview.review = action.payload.review;
        state.currentReview.status = 'completed';
        state.reviews.unshift(state.currentReview);
      }
      state.loading = false;
      state.error = null;
    },
    reviewFailure: (state, action: PayloadAction<string>) => {
      if (state.currentReview) {
        state.currentReview.status = 'failed';
      }
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentReview: (state) => {
      state.currentReview = null;
      state.error = null;
    },
    clearReviews: (state) => {
      state.reviews = [];
      state.currentReview = null;
      state.error = null;
    },
  },
});

export const {
  startReview,
  reviewSuccess,
  reviewFailure,
  clearCurrentReview,
  clearReviews,
} = reviewSlice.actions;

export default reviewSlice.reducer; 