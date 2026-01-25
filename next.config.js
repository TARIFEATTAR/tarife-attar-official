/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
    ],
  },
  // Improve build performance
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  
  // =========================================================================
  // ATLAS COLLECTION REBRAND — URL REDIRECTS
  // Redirect old product slugs to new Atlas Collection names
  // =========================================================================
  async redirects() {
    return [
      // =========================================================================
      // OMNISEND / EMAIL CAMPAIGN REDIRECTS
      // Handle common "shop" URLs from abandoned cart/checkout emails
      // For abandoned cart emails, redirect to cart page (not collection)
      // =========================================================================
      { source: '/shop', destination: '/cart', permanent: false },
      { source: '/shopify', destination: '/cart', permanent: false },
      { source: '/shopify/shop', destination: '/cart', permanent: false },
      { source: '/collections', destination: '/cart', permanent: false },
      { source: '/collections/all', destination: '/cart', permanent: false },
      { source: '/store', destination: '/cart', permanent: false },
      { source: '/browse', destination: '/cart', permanent: false },
      
      // EMBER TERRITORY
      { source: '/product/granada-amber', destination: '/product/granada', permanent: true },
      { source: '/product/beloved', destination: '/product/granada', permanent: true },
      { source: '/product/honey-oudh', destination: '/product/caravan', permanent: true },
      { source: '/product/vanilla-sands', destination: '/product/dune', permanent: true },
      { source: '/product/teeb-musk', destination: '/product/close', permanent: true },
      { source: '/product/oud-fire', destination: '/product/aden', permanent: true },
      { source: '/product/rogue', destination: '/product/aden', permanent: true },
      { source: '/product/dubai-musk', destination: '/product/dubai', permanent: true },
      { source: '/product/himalayan-musk', destination: '/product/clarity', permanent: true },
      { source: '/product/frankincense-myrrh', destination: '/product/devotion', permanent: true },
      { source: '/product/frankincense-and-myrrh', destination: '/product/devotion', permanent: true },
      { source: '/product/black-musk', destination: '/product/obsidian', permanent: true },
      { source: '/product/cairo-musk', destination: '/product/cairo', permanent: true },
      { source: '/product/ancient', destination: '/product/cairo', permanent: true },
      
      // TERRA TERRITORY
      { source: '/product/sicilian-oudh', destination: '/product/sicily', permanent: true },
      { source: '/product/oud-tobacco', destination: '/product/havana', permanent: true },
      { source: '/product/oud-and-tobacco', destination: '/product/havana', permanent: true },
      { source: '/product/oud-aura', destination: '/product/regalia', permanent: true },
      { source: '/product/black-ambergris', destination: '/product/onyx', permanent: true },
      
      // PETAL TERRITORY
      { source: '/product/arabian-jasmine', destination: '/product/jasmine', permanent: true },
      { source: '/product/turkish-rose', destination: '/product/damascus', permanent: true },
      { source: '/product/white-egyptian-musk', destination: '/product/ritual', permanent: true },
      { source: '/product/musk-tahara', destination: '/product/tahara', permanent: true },
      { source: '/product/peach-memoir', destination: '/product/cherish', permanent: true },
      
      // TIDAL TERRITORY
      { source: '/product/del-mare', destination: '/product/delmar', permanent: true },
      { source: '/product/blue-oudh', destination: '/product/fathom', permanent: true },
      { source: '/product/china-rain', destination: '/product/kyoto', permanent: true },
      { source: '/product/coconut-jasmine', destination: '/product/bahia', permanent: true },
      
      // Also handle /products/ path (Shopify-style URLs)
      { source: '/products/granada-amber', destination: '/product/granada', permanent: true },
      { source: '/products/honey-oudh', destination: '/product/caravan', permanent: true },
      { source: '/products/vanilla-sands', destination: '/product/dune', permanent: true },
      { source: '/products/teeb-musk', destination: '/product/close', permanent: true },
      { source: '/products/oud-fire', destination: '/product/aden', permanent: true },
      { source: '/products/dubai-musk', destination: '/product/dubai', permanent: true },
      { source: '/products/himalayan-musk', destination: '/product/clarity', permanent: true },
      { source: '/products/frankincense-myrrh', destination: '/product/devotion', permanent: true },
      { source: '/products/black-musk', destination: '/product/obsidian', permanent: true },
      { source: '/products/cairo-musk', destination: '/product/ancient', permanent: true },
      { source: '/products/sicilian-oudh', destination: '/product/sicily', permanent: true },
      { source: '/products/marrakesh', destination: '/product/marrakesh', permanent: true },
      { source: '/products/oud-tobacco', destination: '/product/havana', permanent: true },
      { source: '/products/oud-aura', destination: '/product/regalia', permanent: true },
      { source: '/products/black-ambergris', destination: '/product/onyx', permanent: true },
      { source: '/products/arabian-jasmine', destination: '/product/jasmine', permanent: true },
      { source: '/products/turkish-rose', destination: '/product/damascus', permanent: true },
      { source: '/products/white-egyptian-musk', destination: '/product/ritual', permanent: true },
      { source: '/products/musk-tahara', destination: '/product/tahara', permanent: true },
      { source: '/products/peach-memoir', destination: '/product/cherish', permanent: true },
      { source: '/products/del-mare', destination: '/product/delmar', permanent: true },
      { source: '/products/blue-oudh', destination: '/product/fathom', permanent: true },
      { source: '/products/china-rain', destination: '/product/kyoto', permanent: true },
      { source: '/products/coconut-jasmine', destination: '/product/bahia', permanent: true },
      { source: '/products/regatta', destination: '/product/regatta', permanent: true },
    ];
  },
};

module.exports = nextConfig;
