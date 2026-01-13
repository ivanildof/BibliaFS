export interface ShareData {
  title: string;
  text: string;
  url?: string;
}

export async function shareContent(data: ShareData): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url || window.location.href,
      });
      return true;
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share failed:", error);
      }
      return false;
    }
  }
  return false;
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text).then(
    () => true,
    () => false
  );
}

export function generateVerseShareText(
  bookName: string,
  chapter: number,
  verseNumber: number,
  verseText: string,
  version: string
): string {
  return `"${verseText}"\n\n— ${bookName} ${chapter}:${verseNumber} (${version.toUpperCase()})\n\nCompartilhado via BíbliaFS`;
}

export function generateVerseShareUrl(
  book: string,
  chapter: number,
  verse: number,
  version: string
): string {
  // Import dynamically to avoid circular dependency
  const APP_URL = "https://bibliafs.com.br";
  return `${APP_URL}/bible?book=${book}&chapter=${chapter}&verse=${verse}&version=${version}`;
}

export function getWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function getTelegramShareUrl(text: string, url?: string): string {
  const params = new URLSearchParams({ text });
  if (url) params.append("url", url);
  return `https://t.me/share/url?${params.toString()}`;
}

export function getTwitterShareUrl(text: string, url?: string): string {
  const params = new URLSearchParams({ text });
  if (url) params.append("url", url);
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function getFacebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
