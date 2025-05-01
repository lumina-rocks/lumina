// THIS FIXES A BUG WITH NEXT IMAGE
// SEE: https://github.com/vercel/next.js/issues/33488
// FIX: https://github.com/vercel/next.js/issues/33488#issuecomment-1879127189

import NextImage from "next/image";

const Image = ({...props }: any) => {
    const imageLoader = ({src, width, quality}: any) => {
        return `${src}?w=${width}&q=${quality || 75}`
    }

    return (
        <NextImage loader={imageLoader}  {...props} />
    )
  }

export default Image;