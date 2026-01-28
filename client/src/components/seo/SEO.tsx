import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
}

export function SEO({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  canonical,
}: SEOProps) {
  const siteName = "BíbliaFS v1.0.6";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = "BíbliaFS - Um aplicativo bíblico premium com IA teológica, planos de leitura personalizados e comunidade espiritual.";
  const defaultOgImage = "https://bibliafs.replit.app/og-image.png"; // Placeholder for actual branding image

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update meta tags
    const updateMeta = (name: string, content: string, attr = "name") => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    updateMeta("description", description || defaultDescription);
    updateMeta("og:title", ogTitle || fullTitle, "property");
    updateMeta("og:description", ogDescription || description || defaultDescription, "property");
    updateMeta("og:image", ogImage || defaultOgImage, "property");
    updateMeta("og:type", ogType, "property");
    updateMeta("og:site_name", siteName, "property");

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }
  }, [title, description, ogTitle, ogDescription, ogImage, ogType, canonical]);

  return null;
}
