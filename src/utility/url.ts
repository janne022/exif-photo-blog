// Remove protocol, www, and trailing slash from url
export const shortenUrl = (url?: string) => url
  ? url
    .replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')
    .replace(/\/$/, '')
  : undefined;

// Remove protocol, and trailing slash from url
export const removeUrlProtocol = (url?: string) => url
  ? url
    .replace(/^(?:https?:\/\/)?/i, '')
    .replace(/\/$/, '')
  : undefined;

// Add protocol to url and remove trailing slash
export const makeUrlAbsolute = (url?: string) => url !== undefined
  ? (!url.startsWith('http') ? `https://${url}` : url)
    .replace(/\/$/, '')
  : undefined;

export const removeParamsFromUrl = (urlString?: string, params: string[] = []) => {
  try {
    if (!urlString) return undefined;

    // Make sure it has a protocol; otherwise URL constructor will throw
    const absoluteUrl = urlString.startsWith('http')
      ? urlString
      : `https://${urlString}`;

    const url = new URL(absoluteUrl);
    for (const param of params) {
      url.searchParams.delete(param);
    }
    console.log("NEW URL:" + url.toString());
    return url.toString();
  } catch (error) {
    console.error('Invalid URL in removeParamsFromUrl:', urlString, error);
    return undefined;
  }
};


export const downloadFileFromBrowser = async (
  url: string,
  fileName: string,
) => {
  const blob = await fetch(url)
    .then(response => response.blob());
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};
