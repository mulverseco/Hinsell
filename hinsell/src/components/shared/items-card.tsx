import React, { Suspense } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';
import { formatPrice } from '@/utils/format-price';
import { Item } from '@/core/generated/schemas';
import { ProductImage } from './item-image';
import { AddToCart, AddToCartButton } from './add-to-cart';

export const ItemCard = ({ item }: { item: Item }) => {
//   const hasNoOptions = item.options.length === 0;
//   const hasOneOptionWithOneValue = item.options.length === 1 && item.options[0].values.length === 1;
//   const justHasColorOption = item.options.length === 1 && item.options[0].name.toLowerCase() === 'color';

//   const renderInCardAddToCart = hasNoOptions || hasOneOptionWithOneValue || justHasColorOption;

  return (
    <div className="relative w-full aspect-[3/4] md:aspect-square bg-muted group overflow-hidden">
      <Link
        href={`/product/${item.id}`}
        className="block size-full focus-visible:outline-none"
        aria-label={`View details for ${item.name}, price ${item.variants?.[0]?.sales_price ?? ''}`}
        prefetch
      >
        <Suspense fallback={null}>
          <ProductImage media={item?.media} />
        </Suspense>
      </Link>

      {/* Interactive Overlay */}
      <div className="absolute inset-0 p-2 w-full pointer-events-none">
        <div className="flex gap-6 justify-between items-baseline px-3 py-1 w-full font-semibold transition-all duration-300 translate-y-0 max-md:hidden group-hover:opacity-0 group-focus-visible:opacity-0 group-hover:-translate-y-full group-focus-visible:-translate-y-full">
          <p className="text-sm uppercase 2xl:text-base text-balance">{item.name}</p>
          <div className="flex gap-2 items-center text-sm uppercase 2xl:text-base">
            {formatPrice(item.variants?.[0]?.sales_price ?? '0', 'usd')}
            {item.variants?.[0]?.sales_price && (
              <span className="line-through opacity-30">
                {formatPrice(item.variants?.[0]?.sales_price ?? '0', 'usd')}
              </span>
            )}
          </div>
        </div>

        <div className="flex absolute inset-x-3 bottom-3 flex-col gap-8 px-2 py-3 rounded-md transition-all duration-300 pointer-events-none bg-popover md:opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 md:translate-y-1/3 group-hover:translate-y-0 group-focus-visible:translate-y-0 group-hover:pointer-events-auto group-focus-visible:pointer-events-auto max-md:pointer-events-auto">
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 items-end">
            <p className="text-lg font-semibold text-pretty">{item.name}</p>
            <div className="flex gap-2 items-center place-self-end text-lg font-semibold">
               {formatPrice(item.variants?.[0]?.sales_price ?? '0', 'usd')}
            {item.variants?.[0]?.sales_price && (
              <span className="line-through opacity-30">
                {formatPrice(item.variants?.[0]?.sales_price ?? '0', 'usd')}
              </span>
            )}
            </div>
            {/* {renderInCardAddToCart ? (
              <Suspense fallback={null}>
                <div className="self-center">
                  <VariantSelector product={product} />
                </div>
              </Suspense>
            ) : (
              <></>
            )} */}

            {/* {renderInCardAddToCart ? ( */}
              <Suspense fallback={<AddToCartButton className="col-start-2" item={item}  />}>
                <AddToCart className="col-start-2" item={item} />
              </Suspense>
            {/* // ) : (
            //   <Button className="col-start-2" size="sm" variant="default" asChild>
            //     <Link href={`/product/${product.handle}`}>
            //       <div className="flex justify-between items-center w-full">
            //         <span>View Product</span>
            //         <ArrowRightIcon />
            //       </div>
            //     </Link>
            //   </Button>
            // )} */}
          </div>
        </div>
      </div>
    </div>
  );
};
