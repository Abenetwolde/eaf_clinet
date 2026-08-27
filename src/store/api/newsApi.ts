import { apiSlice } from './apiSlice';

export interface NewsArticle {
  id: string;
  title: string;
  date: string;
  category: string;
  shortDescription: string;
  imageUrl?: string | null;
  author: string;
  isFeatured: boolean;
}

export interface NewsArticleDetail {
  id: string;
  title: string;
  date: string;
  category: string;
  shortDescription: string;
  content: string;
  imageUrl?: string | null;
  insideImages?: string[];
  author: string;
  isFeatured: boolean;
}

export interface NewsListResponse {
  success: boolean;
  data: NewsArticle[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface NewsDetailResponse {
  success: boolean;
  data: NewsArticleDetail;
}

export interface GetNewsParams {
  page?: number;
  limit?: number;
  category?: string;
}

export const newsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNews: builder.query<NewsArticle[], GetNewsParams | void>({
      query: (params) => ({
        url: '/news',
        params: params || undefined,
      }),
      transformResponse: (response: NewsListResponse) => response.data,
      providesTags: [{ type: 'News' as const, id: 'LIST' }],
      keepUnusedDataFor: 86400,
    }),

    getNewsById: builder.query<NewsArticleDetail, string>({
      query: (id) => `/news/${id}`,
      transformResponse: (response: NewsDetailResponse) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'News' as const, id }],
      keepUnusedDataFor: 86400,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNewsQuery,
  useGetNewsByIdQuery,
} = newsApi;
