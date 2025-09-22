export type TResponseDto<T> = {
  success: boolean;
  data: T | null;
  statusCode?: number;
  message: string;
};
