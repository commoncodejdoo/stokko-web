import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Warehouse, ClipboardList, Zap, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/view/common/components/button.component';
import { Card } from '@/view/common/components/card.component';
import { BrandGlyph, BrandWordmark } from '@/view/common/components/brand-glyph.component';
import { useOnboardingStore } from '@/view/common/store/onboarding-store';
import { cn } from '@/view/common/utils/cn';

interface Slide {
  icon: typeof Box;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: Box,
    title: 'Dobrodošli u Stokko!',
    body: 'Tvoj inventar — uvijek točan, uvijek na dlanu. Bez papira, bez Excela.',
  },
  {
    icon: Warehouse,
    title: 'Više skladišta, jedan pregled',
    body: 'Prati zalihe po više lokacija odjednom. Boje pokazuju što je kritično.',
  },
  {
    icon: ClipboardList,
    title: 'Brzo unesi nabavu',
    body: 'Stigla je roba? Otvori Stokko, unesi stavke i potvrdi. Stanje se osvježi automatski.',
  },
  {
    icon: Zap,
    title: '⌘K za brze akcije',
    body: 'Brza pretraga, navigacija i akcije su uvijek na dohvat tipkovnice.',
  },
];

export function OnboardingScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const markSeen = useOnboardingStore((s) => s.markSeen);
  const [index, setIndex] = useState(0);
  const isReplay = searchParams.get('replay') === '1';
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];
  const Icon = slide.icon;

  const finish = () => {
    if (!isReplay) markSeen();
    navigate(isReplay ? '/postavke' : '/login', { replace: true });
  };

  return (
    <div className="h-full w-full flex flex-col bg-bg">
      {/* Skip button */}
      <div className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <BrandGlyph size={28} />
          <BrandWordmark className="text-[18px]" />
        </div>
        <button
          type="button"
          onClick={finish}
          className="text-2xs font-semibold text-muted hover:text-text transition-colors"
        >
          Preskoči
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center px-8">
        <Card padding="lg" className="w-full max-w-[480px] flex flex-col items-center gap-5 py-12 text-center">
          <div className="size-16 rounded-2xl bg-accent-soft text-accent flex items-center justify-center">
            <Icon size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="m-0 text-[22px] font-semibold tracking-tight">{slide.title}</h1>
            <p className="m-0 text-[13px] text-muted max-w-[360px]">{slide.body}</p>
          </div>

          {/* Dots */}
          <div className="flex gap-1.5 pt-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-6 bg-accent' : 'w-1.5 bg-border hover:bg-muted',
                )}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Footer nav */}
      <div className="px-8 py-6 flex items-center justify-between max-w-[480px] w-full mx-auto">
        <Button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          Natrag
        </Button>
        <span className="text-2xs text-muted tabular-nums">
          {index + 1} / {SLIDES.length}
        </span>
        <Button
          variant="primary"
          icon={isLast ? <Check size={14} /> : <ArrowRight size={14} />}
          onClick={() => (isLast ? finish() : setIndex((i) => i + 1))}
        >
          {isLast ? (isReplay ? 'Završi' : 'Počni') : 'Dalje'}
        </Button>
      </div>
    </div>
  );
}
