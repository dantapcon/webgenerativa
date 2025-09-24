export const getURL = () => {
  // En el cliente (browser), process.env.NODE_ENV siempre está disponible
  // pero las otras variables de entorno necesitan el prefijo NEXT_PUBLIC_
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/'
  
  // Si estamos en el browser y no tenemos una URL válida, usar window.location
  if (typeof window !== 'undefined' && url === 'http://localhost:3000/' && window.location.hostname !== 'localhost') {
    url = window.location.origin;
  }
  
  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`
  
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`
  
  return url
}
