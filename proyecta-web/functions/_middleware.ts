/**
 * Divulgaría — Cloudflare Pages Middleware
 *
 * Propósito: añadir Clear-Site-Data SÓLO en respuestas HTML (no en assets).
 * Esto fuerza a los browsers móviles a borrar su caché de HTTP cuando
 * detectan una versión nueva de la SPA, evitando el problema de "bundle viejo en caché".
 *
 * Los assets (/assets/*, /brand/*) tienen Cache-Control: immutable y NO
 * necesitan Clear-Site-Data — sus nombres son hasheados y únicos por deploy.
 */
export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context
  const url = new URL(request.url)
  const path = url.pathname

  // Pasar la solicitud al handler de CF Pages
  const response = await next()

  // Sólo añadir Clear-Site-Data en rutas que NO son assets ni recursos estáticos
  const isAsset =
    path.startsWith("/assets/") ||
    path.startsWith("/brand/") ||
    path.match(/\.(js|css|woff2|ttf|otf|ico|svg|png|jpg|jpeg|webp|gif|mp4|pdf)$/i) !== null

  if (!isAsset) {
    const newHeaders = new Headers(response.headers)
    // Borrar caché HTTP del origin en el browser — elimina bundles viejos cacheados
    newHeaders.set("Clear-Site-Data", '"cache"')
    // Reforzar no-cache en el index.html y rutas SPA
    newHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate")
    newHeaders.set("Pragma", "no-cache")
    newHeaders.set("Expires", "0")

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    })
  }

  return response
}
