export default function Sitemap(){ return null; }

export async function getServerSideProps({ req, res }){
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = (req.headers['x-forwarded-proto'] || 'https');
  const base = `${proto}://${host}`;
  const products = require('../public/products.json');
  const urls = [
    `${base}/`,
    `${base}/myorders`,
    ...products.map(p => `${base}/product/${p.id}`),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(u => `<url><loc>${u}</loc></url>`).join('')}
  </urlset>`;
  res.setHeader('Content-Type','application/xml');
  res.write(xml);
  res.end();
  return { props: {} };
}
