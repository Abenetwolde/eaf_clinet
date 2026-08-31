import { apiSlice } from './apiSlice';

// ─── Response Schemas (mirrors EACRMS Swagger) ───────────────────────────────

export type GalleryCategory =
  | 'ALL'
  | 'CHAMPIONSHIP'
  | 'MARATHON'
  | 'ROAD_RACE'
  | 'TRAINING'
  | 'NATIONAL_TEAM'
  | 'HISTORIC';

export type GalleryMediaType = 'PHOTO' | 'VIDEO';

/** Gallery album as returned by GET /gallery (list) */
export interface GalleryAlbum {
  id: string;
  title: string;
  amharicTitle?: string | null;
  category: GalleryCategory;
  type: GalleryMediaType;
  coverImage: string;
  description: string;
  eventDate: string;        // ISO date-time
  location: string;
  photographer?: string | null;
  videoUrl?: string | null;
  videoDuration?: string | null;
  capturesCount: number;
  isFeatured: boolean;
}

/** Individual media capture within an album */
export interface GalleryCapture {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  title: string;
  caption: string;
  photographer?: string | null;
  timestamp?: string | null;
}

/** Full album detail as returned by GET /gallery/{id} */
export interface GalleryAlbumDetail extends GalleryAlbum {
  captures: GalleryCapture[];
}

// ─── Request / Response wrappers ─────────────────────────────────────────────

export interface GalleryListResponse {
  success: boolean;
  data: GalleryAlbum[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface GalleryDetailResponse {
  success: boolean;
  data: GalleryAlbumDetail;
}

export interface GetGalleryParams {
  category?: GalleryCategory;
  type?: GalleryMediaType;
  featured?: boolean;
  page?: number;
  limit?: number;
}

// ─── RTK Query endpoints ──────────────────────────────────────────────────────

export const galleryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /gallery — public, paginated list of albums */
    getGallery: builder.query<GalleryListResponse, GetGalleryParams | void>({
      query: (params) => ({
        url: '/gallery',
        params: params || undefined,
      }),
      providesTags: [{ type: 'Gallery' as const, id: 'LIST' }],
      keepUnusedDataFor: 3600,
    }),

    /** GET /gallery/{id} — public, full album detail with captures */
    getGalleryById: builder.query<GalleryAlbumDetail, string>({
      query: (id) => `/gallery/${id}`,
      transformResponse: (response: GalleryDetailResponse) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Gallery' as const, id }],
      keepUnusedDataFor: 3600,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetGalleryQuery,
  useGetGalleryByIdQuery,
  useLazyGetGalleryByIdQuery,
} = galleryApi;
