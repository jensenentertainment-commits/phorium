/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Next trenger ikke å type-sjekke ALT hver gang i dev
    ignoreBuildErrors: true,
  },
  eslint: {
    // Kjør lint manuelt når DU vil, ikke hver gang
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
