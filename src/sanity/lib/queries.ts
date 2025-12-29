import { groq } from "next-sanity";

// Product queries
export const allProductsQuery = groq`
  *[_type == "product"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    brand,
    year,
    concentration,
    mainImage,
    "excerpt": description[0].children[0].text
  }
`;

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    brand,
    year,
    concentration,
    perfumer,
    notes,
    description,
    mainImage,
    gallery
  }
`;

// Exhibit queries
export const allExhibitsQuery = groq`
  *[_type == "exhibit"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    subtitle,
    coverImage,
    "excerpt": body[0].children[0].text
  }
`;

export const exhibitBySlugQuery = groq`
  *[_type == "exhibit" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    subtitle,
    body,
    coverImage,
    featuredProducts[]-> {
      _id,
      title,
      slug,
      mainImage
    }
  }
`;
