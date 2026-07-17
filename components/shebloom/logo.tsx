import { cn } from '@/lib/utils';
import Image from 'next/image';

interface BloomLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  as?: 'h1' | 'h2' | 'h3' | 'span';
  layout?: 'vertical' | 'horizontal'; // kept for backwards compatibility but basically ignored for a single image
  showIcon?: boolean; // ignored for image
  showText?: boolean; // ignored for image
}

const sizeMap = {
  sm: 120,
  md: 160,
  lg: 200,
  xl: 260,
};

export function BloomLogo({
  className,
  size = 'md',
  as: Tag = 'span',
  layout = 'horizontal',
  showIcon = true,
  showText = true,
}: BloomLogoProps) {
  const width = sizeMap[size];
  const height = Math.round(width * 0.77); // The aspect ratio of the provided logo is approx 4:3

  return (
    <div className={cn("flex flex-col items-center justify-center relative", className)}>
      <Tag className="sr-only">SheBloom</Tag>
      <Image
        src="/images/logo.png"
        alt="SheBloom Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  );
}
