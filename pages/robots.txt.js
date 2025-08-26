export default function Robots(){ return null; }

export async function getServerSideProps({ req, res }){
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = (req.headers['x-forwarded-proto'] || 'https');
  const base = `${proto}://${host}`;
  const txt = `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml`;
  res.setHeader('Content-Type','text/plain');
  res.write(txt);
  res.end();
  return { props: {} };
}
