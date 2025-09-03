// components/AddToCartButton.tsx
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react'; 
import { toast } from 'sonner';
import { ItemUnit, ItemVariant } from '@/core/generated/schemas';
import { useECommerceStore } from '@/core/store';

interface AddToCartButtonProps {
  variant: ItemVariant;
  quantity?: number; // Default to 1
  unit: ItemUnit; // Selected unit
  className?: string; // For custom styling
  disabled?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  variant,
  quantity = 1,
  unit,
  className,
  disabled = false,
}) => {
  const { addToCart, checkAvailability } = useECommerceStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAddToCart = async () => {
    if (disabled) return;

    setIsLoading(true);
    try {
      if (!checkAvailability(variant.id!, quantity)) {
        toast.error('Insufficient stock available.');
        return;
      }
      addToCart(variant, quantity, unit);
      toast.success(`${variant.code || 'Item'} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isLoading}
      className={`w-full ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
      ) : (
        <ShoppingCart className="h-5 w-5 mr-2" />
      )}
      Add to Cart
    </Button>
  );
};

export default AddToCartButton;