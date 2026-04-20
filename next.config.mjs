/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Care types removed in Bergen-County pivot — keep search intent
      // alive by pre-applying the closest-substitute filter where it
      // exists, otherwise drop to bare /search.
      {
        source: "/care-types/independent-living",
        destination: "/search?type=Assisted%20Living",
        permanent: true,
      },
      {
        source: "/care-types/nursing-home",
        destination: "/search?type=Assisted%20Living",
        permanent: true,
      },
      {
        source: "/care-types/home-care",
        destination: "/search",
        permanent: true,
      },
      {
        source: "/care-types/hospice",
        destination: "/search",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
