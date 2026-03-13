import { Image, ImageSourcePropType } from 'react-native';
import { BASE_URL } from '../services/api';

const encodePathSegment = (segment: string) => {
  if (!segment) return segment;
  try {
    return encodeURIComponent(decodeURIComponent(segment));
  } catch {
    return encodeURIComponent(segment);
  }
};

const normalizeRelativePath = (img: string) => {
  const normalized = img.startsWith('/') ? img : `/${img}`;
  return normalized
    .split('/')
    .map((segment, index) => (index === 0 ? segment : encodePathSegment(segment)))
    .join('/');
};

export const getImageUrl = (img?: string | null): string | undefined => {
  if (!img) return undefined;

  if (img.startsWith('data:')) {
    return img;
  }

  if (img.startsWith('http://') || img.startsWith('https://')) {
    try {
      const url = new URL(img);
      url.pathname = normalizeRelativePath(url.pathname);
      return url.toString();
    } catch {
      return img.replace(/ /g, '%20');
    }
  }

  return `${BASE_URL}${normalizeRelativePath(img)}`;
};

export const getCachedImageSource = (img?: string | null): ImageSourcePropType | undefined => {
  const uri = getImageUrl(img);
  if (!uri) return undefined;
  return { uri, cache: 'force-cache' } as ImageSourcePropType;
};

export const prefetchImages = async (images: Array<string | null | undefined>) => {
  const uris = images
    .map((image) => getImageUrl(image))
    .filter((uri): uri is string => Boolean(uri));

  if (uris.length === 0) return;

  await Promise.allSettled(uris.map((uri) => Image.prefetch(uri)));
};
