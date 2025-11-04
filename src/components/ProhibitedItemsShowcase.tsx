import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ImageOff,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProhibitedItem {
  id: number;
  name: string;
  description: string;
  slug: string;
}

export interface ExampleSelection {
  slug: string;
  name: string;
  url: string;
}

const PROHIBITED_ITEMS: ProhibitedItem[] = [
  {
    id: 0,
    name: "Baton",
    slug: "baton",
    description: "Impact weapon classified as restricted carry-on equipment.",
  },
  {
    id: 1,
    name: "Pliers",
    slug: "pliers",
    description: "Hand tool with gripping jaws that may conceal sharp edges.",
  },
  {
    id: 2,
    name: "Hammer",
    slug: "hammer",
    description: "Striking tool considered a potential impact threat.",
  },
  {
    id: 3,
    name: "Powerbank",
    slug: "powerbank",
    description: "Lithium-ion device requiring battery capacity verification.",
  },
  {
    id: 4,
    name: "Scissors",
    slug: "scissors",
    description: "Bladed item with points exceeding the allowable length.",
  },
  {
    id: 5,
    name: "Wrench",
    slug: "wrench",
    description: "Solid metal tool that can act as an improvised weapon.",
  },
  {
    id: 6,
    name: "Gun",
    slug: "gun",
    description:
      "Firearm components and fully-assembled weapons are prohibited.",
  },
  {
    id: 7,
    name: "Bullet",
    slug: "bullet",
    description:
      "Ammunition and casings fall under hazardous security materials.",
  },
  {
    id: 8,
    name: "Sprayer",
    slug: "sprayer",
    description: "Pressurized spray containers may contain flammable contents.",
  },
  {
    id: 9,
    name: "Handcuffs",
    slug: "handcuffs",
    description: "Restraining devices stored under controlled security access.",
  },
  {
    id: 10,
    name: "Knife",
    slug: "knife",
    description: "Cutting instruments with blades are disallowed in carry-ons.",
  },
  {
    id: 11,
    name: "Lighter",
    slug: "lighter",
    description:
      "Ignition sources subject to hazardous materials restrictions.",
  },
];

const EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

interface ExampleItemCardProps {
  item: ProhibitedItem;
  onSelect?: (selection: ExampleSelection) => void;
}

const ExampleItemCard = ({ item, onSelect }: ExampleItemCardProps) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const imageSrc = useMemo(
    () => `/example-images/${item.slug}.${EXTENSIONS[imageIndex]}`,
    [item.slug, imageIndex]
  );

  useEffect(() => {
    setHasLoaded(false);
  }, [imageSrc]);

  const handleImageError = () => {
    if (imageIndex < EXTENSIONS.length - 1) {
      setImageIndex((index) => index + 1);
    } else {
      setHasError(true);
    }
  };

  const handleImageLoad = () => {
    setHasLoaded(true);
  };

  const handleSelect = () => {
    if (!onSelect || hasError || !hasLoaded) return;
    onSelect({
      slug: item.slug,
      name: item.name,
      url: imageSrc,
    });
  };

  const canSelect = Boolean(onSelect) && !hasError && hasLoaded;

  return (
    <button
      type="button"
      onClick={handleSelect}
      disabled={!canSelect}
      className={`group w-full rounded-md border border-border/60 bg-card/70 text-left shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 ${
        canSelect
          ? "cursor-pointer hover:border-primary/50 hover:shadow-md"
          : "cursor-not-allowed opacity-70"
      }`}
    >
      <div className="relative flex aspect-[4/3] items-center justify-center bg-muted/60">
        {!hasError ? (
          <img
            src={imageSrc}
            alt={`${item.name} example`}
            className="h-full w-full object-contain p-2"
            loading="lazy"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 px-3 text-xs text-muted-foreground">
            <ImageOff className="h-5 w-5" />
            <span>Add {item.name.toLowerCase()} image in example-images.</span>
          </div>
        )}
      </div>
      <div className="space-y-1.5 p-3">
        <p className="text-sm font-semibold text-foreground">{item.name}</p>
        <p className="text-xs leading-snug text-muted-foreground/90">
          {item.description}
        </p>
      </div>
    </button>
  );
};

interface ProhibitedItemsShowcaseProps {
  onExampleSelect?: (selection: ExampleSelection) => void;
}

const ProhibitedItemsShowcase = ({
  onExampleSelect,
}: ProhibitedItemsShowcaseProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    dragFree: true,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateScrollButtons();
    emblaApi.on("select", updateScrollButtons);
    emblaApi.on("reInit", updateScrollButtons);

    return () => {
      emblaApi.off("select", updateScrollButtons);
      emblaApi.off("reInit", updateScrollButtons);
    };
  }, [emblaApi, updateScrollButtons]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  return (
    <Card className="bg-gradient-surface border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-base font-semibold">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Prohibited Item Examples
          </span>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{PROHIBITED_ITEMS.length} items</Badge>
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                aria-label="Previous examples"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollNext}
                disabled={!canScrollNext}
                aria-label="Next examples"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-3">
              {PROHIBITED_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="min-w-[220px] max-w-[260px] flex-shrink-0"
                >
                  <ExampleItemCard item={item} onSelect={onExampleSelect} />
                </div>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background via-background/80 to-transparent" />
        </div>
        <div className="flex justify-center gap-2 sm:hidden pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Previous examples"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Next examples"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProhibitedItemsShowcase;
