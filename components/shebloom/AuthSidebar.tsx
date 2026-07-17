import { BloomLogo } from './logo';
import { User, Stethoscope, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export function AuthSidebar() {
  return (
    <div className="hidden md:flex md:col-span-5 relative bg-[#EADCF6] overflow-hidden h-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src="/images/left_banner_full.jpg" 
        alt="SheBloom Features" 
        className="w-full h-full object-cover object-right"
      />
    </div>
  );
}
