// Product schema type definition
// This defines the structure for fragrance products in the archive

export const productSchema = {
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "brand",
      title: "Brand / House",
      type: "string",
    },
    {
      name: "year",
      title: "Year",
      type: "number",
      description: "Year of release",
    },
    {
      name: "concentration",
      title: "Concentration",
      type: "string",
      options: {
        list: [
          { title: "Parfum", value: "parfum" },
          { title: "Eau de Parfum", value: "edp" },
          { title: "Eau de Toilette", value: "edt" },
          { title: "Eau de Cologne", value: "edc" },
          { title: "Extrait", value: "extrait" },
        ],
      },
    },
    {
      name: "perfumer",
      title: "Perfumer / Nose",
      type: "string",
    },
    {
      name: "notes",
      title: "Notes",
      type: "object",
      fields: [
        { name: "top", title: "Top Notes", type: "array", of: [{ type: "string" }] },
        { name: "heart", title: "Heart Notes", type: "array", of: [{ type: "string" }] },
        { name: "base", title: "Base Notes", type: "array", of: [{ type: "string" }] },
      ],
    },
    {
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      brand: "brand",
      media: "mainImage",
    },
    prepare(selection: { title: string; brand: string; media: any }) {
      const { title, brand, media } = selection;
      return {
        title,
        subtitle: brand,
        media,
      };
    },
  },
};
