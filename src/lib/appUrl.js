export function getAppUrl(path = '') {
  const basePath = import.meta.env.BASE_URL || '/'
  const normalizedBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`
  const normalizedPath = String(path).replace(/^\/+/, '')
  const appUrl = new URL(normalizedBasePath, window.location.origin)

  appUrl.hash = normalizedPath ? `/${normalizedPath}` : '/'

  return appUrl.toString()
}

export function getAppRootUrl() {
  const basePath = import.meta.env.BASE_URL || '/'
  const normalizedBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`
  return new URL(normalizedBasePath, window.location.origin).toString()
}
