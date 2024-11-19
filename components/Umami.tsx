import Script from "next/script";
import React from "react";

const Umami = () => {
    if(process.env.NEXT_PUBLIC_ENABLE_UMAMI == "true") {
        return (
            <Script
                src={`${process.env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
                strategy="afterInteractive"
                data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
                defer
            />
        );
    } else {
        return null;
    }
};

export default Umami;
