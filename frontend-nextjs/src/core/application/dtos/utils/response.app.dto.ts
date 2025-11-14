export type TResponseDto<T> = {
  success: boolean;
  data: T | null;
  statusCode?: number;
  message: string;
};

export type TResOutContent<T> = {
  ok: boolean;
  message: string | null;
  data: T | null;
} | null;
