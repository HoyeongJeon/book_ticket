import { join } from 'path';

export const ROOT_PATH = process.cwd();
export const PUBLIC_FOLDER_NAME = 'public';
export const CONCERT_IMAGE_FOLDER_NAME = 'concert';

// 콘서트 포스터 저장할 폴더
export const CONCERT_IMAGE_FOLDER_PATH = join(
  ROOT_PATH,
  PUBLIC_FOLDER_NAME,
  CONCERT_IMAGE_FOLDER_NAME,
);
