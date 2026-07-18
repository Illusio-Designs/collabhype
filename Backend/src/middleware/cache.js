// Sets Cache-Control on safe GET responses so browsers and any CDN in front of
// the API can cache public reads. Never caches authenticated requests (a bearer
// token present) or non-GET methods.
//   maxAge  — browser cache seconds
//   sMaxAge — shared/CDN cache seconds (defaults to maxAge)
//   swr     — stale-while-revalidate seconds (defaults to maxAge)
export function cacheControl(maxAge, { sMaxAge, swr } = {}) {
  const s = sMaxAge ?? maxAge;
  const stale = swr ?? maxAge;
  return (req, res, next) => {
    if (req.method === 'GET' && !req.headers.authorization) {
      res.setHeader(
        'Cache-Control',
        `public, max-age=${maxAge}, s-maxage=${s}, stale-while-revalidate=${stale}`,
      );
    } else {
      res.setHeader('Cache-Control', 'no-store');
    }
    next();
  };
}
