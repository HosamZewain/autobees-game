import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, ogTitle, ogDescription, ogType, ogUrl, ogImage }) => {
    const defaultTitle = "أوتوبيس كومبليت - لعبة الكلمات العربية";
    const defaultDescription = "العب أشهر لعبة كلمات عربية أونلاين مع أصدقائك أو بمفردك.";
    const defaultKeywords = "أوتوبيس كومبليت, لعبة كلمات, لعبة عربية, ألعاب أونلاين";

    return (
        <Helmet>
            <title>{title ? `${title} | أوتوبيس كومبليت` : defaultTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <meta name="keywords" content={keywords || defaultKeywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType || "website"} />
            <meta property="og:title" content={ogTitle || title || defaultTitle} />
            <meta property="og:description" content={ogDescription || description || defaultDescription} />
            {ogUrl && <meta property="og:url" content={ogUrl} />}
            {ogImage && <meta property="og:image" content={ogImage} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={ogTitle || title || defaultTitle} />
            <meta name="twitter:description" content={ogDescription || description || defaultDescription} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}
        </Helmet>
    );
};

export default SEO;
