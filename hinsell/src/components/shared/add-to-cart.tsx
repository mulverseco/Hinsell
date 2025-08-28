'use client';

import { Loader, PlusCircleIcon } from 'lucide-react';
import { useMemo, useTransition } from 'react';

import { useParams, useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';
import { Item } from '@/core/generated/schemas';
import { ButtonProps, Button } from 'react-day-picker';
import { motion, AnimatePresence } from 'motion/react';

interface AddToCartProps extends ButtonProps {
  item: Item;
  iconOnly?: boolean;
  icon?: ReactNode;
  className?: string;
}

interface AddToCartButtonProps extends ButtonProps {
  item: Item;
//   selectedVariant?: ProductVariant | null;
  iconOnly?: boolean;
  icon?: ReactNode;
  className?: string;
}

const getBaseProductVariant = (item: Item) => {
  const firstVariant = item.variants?.[0] ?? null;
  return {
    id: item.id,
    title: item.name,
    availableForSale: !item.is_featured,
    selectedOptions: [],
    price: firstVariant?.sales_price ?? 0,
  };
};

export function AddToCartButton({
  item,
  className,
  iconOnly = false,
  icon = <PlusCircleIcon />,
  ...buttonProps
}: AddToCartButtonProps) {

  const [isLoading, startTransition] = useTransition();

  // Resolve variant locally only for variantless products (purely synchronous)


  const getButtonText = () => {
    return 'Add To Cart';
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();


      }}
      className={className}
    >
      <Button
        type="submit"
        aria-label={'Add to cart'}
        className={iconOnly ? undefined : 'flex relative justify-between items-center w-full'}
        {...buttonProps}
      >
        <AnimatePresence initial={false} mode="wait">
          {iconOnly ? (
            <motion.div
              key={isLoading ? 'loading' : 'icon'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex justify-center items-center"
            >
              {isLoading ? <Loader size={getLoaderSize()} /> : <span className="inline-block">{icon}</span>}
            </motion.div>
          ) : (
            <motion.div
              key={isLoading ? 'loading' : getButtonText()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex justify-center items-center w-full"
            >
              {isLoading ? (
                <Loader size={buttonProps.size} />
              ) : (
                <div className="flex justify-between items-center w-full">
                  <span>{getButtonText()}</span>
                  <PlusCircleIcon />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </form>
  );
}

export function AddToCart({
  item,
  className,
  iconOnly = false,
  icon = <PlusCircleIcon />,
  ...buttonProps
}: AddToCartProps) {
  const { variants } = item;




  return (
    <AddToCartButton
      item={item}
      className={className}
      iconOnly={iconOnly}
      icon={icon}
      {...buttonProps}
    />
  );
}
