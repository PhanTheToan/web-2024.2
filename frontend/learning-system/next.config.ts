import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'img-c.udemycdn.com', 
      'pub-82683fceb06e4dd98da0d728fdcd9630.r2.dev'
    ],
  },
  env: {
    BASE_URL: process.env.BASE_URL,
  },
};

export default nextConfig;
