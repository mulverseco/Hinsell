'use client';

// import { useProductImages, useSelectedVariant } from '@/components/products/variant-selector';
import { Item } from '@/core/generated/schemas';

import Image from 'next/image';

export const ProductImage = ({ media = [] }: { media?: Item['media'] }) => {
//   const selectedVariant = useSelectedVariant(item);

//   const [variantImage] = useProductImages(item, selectedVariant?.selectedOptions);

  const first = media[0];

  return (
    <Image
      src={first?.file || "/avatars/avatar.png"}
      alt={first?.alt_text || "tee"}
      width={48}
      height={48}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover size-full"
      quality={100}
    //   placeholder={'blur'}
    //   blurDataURL={media?.thumbhash}
    />
  );
};
