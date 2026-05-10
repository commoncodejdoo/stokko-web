import { BrandGlyph, BrandWordmark } from '@/view/common/components/brand-glyph.component';
import { Spinner } from '@/view/common/components/spinner.component';

export function SplashScreen() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-6 bg-bg">
      <div className="flex items-center gap-3">
        <BrandGlyph size={40} />
        <BrandWordmark className="text-2xl" />
      </div>
      <Spinner size={20} />
    </div>
  );
}
