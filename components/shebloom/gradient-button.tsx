import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

interface GradientButtonProps extends ComponentPropsWithoutRef<'button'> {
  children: ReactNode;
  variant?: 'solid' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
}

const sizeMap = {
  sm: 'h-10 px-5 text-sm',
  md: 'h-12 px-6 text-base',
  lg: 'h-14 px-8 text-lg',
};

export function GradientButton({
  children,
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  asChild = false,
  ...props
}: GradientButtonProps) {
  const base = cn(
    'inline-flex items-center justify-center gap-2',
    'rounded-full font-semibold',
    'transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-bloom-300 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    'active:scale-[0.98]',
    sizeMap[size],
    fullWidth && 'w-full',
  );

  const variantClass =
    variant === 'solid'
      ? cn(
          'bg-bloom-gradient text-white shadow-bloom-btn',
          'hover:shadow-lg hover:shadow-bloom-400/40 hover:brightness-105',
        )
      : cn(
          'bg-bloom-soft text-bloom-700 border border-bloom-200',
          'hover:bg-bloom-100 hover:border-bloom-300',
        );

  const content = (
    <>
      {leftIcon}
      {children}
      {rightIcon}
    </>
  );

  if (asChild) {
    return (
      <Slot className={cn(base, variantClass, className)}>
        {children}
      </Slot>
    );
  }

  return (
    <button className={cn(base, variantClass, className)} {...props}>
      {content}
    </button>
  );
}
