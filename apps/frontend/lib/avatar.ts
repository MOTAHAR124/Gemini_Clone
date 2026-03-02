export function getAvatarImageSrc(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }

  // Proxy external avatar URLs through same-origin endpoint for more reliable rendering.
  if (/^https?:\/\//i.test(url)) {
    return `/api/avatar?url=${encodeURIComponent(url)}`;
  }

  return url;
}

