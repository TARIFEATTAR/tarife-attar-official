import createImageUrlBuilder from "@sanity/image-url";
import { client } from "./client";

// Define a simple type for Sanity image source
type SanityImageSource = {
  asset?: {
    _ref?: string;
    _type?: string;
  };
  _type?: string;
  _key?: string;
};

const imageBuilder = createImageUrlBuilder(client);

export const urlForImage = (source: SanityImageSource | undefined) => {
  if (!source?.asset?._ref) {
    return undefined;
  }

  try {
    return imageBuilder.image(source).auto("format").fit("max");
  } catch (error) {
    console.warn('Failed to build image URL:', error);
    return undefined;
  }
};

// Helper to get URL string directly
export const urlForImageString = (
  source: SanityImageSource | undefined,
  width?: number,
  height?: number
): string | undefined => {
  const builder = urlForImage(source);
  if (!builder) return undefined;

  if (width) builder.width(width);
  if (height) builder.height(height);

  return builder.url();
};
