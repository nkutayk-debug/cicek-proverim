import {
  Sun, Leaf, Drop, Flask, Thermometer, PottedPlant, Flower, Plant, Sparkle, ClockCountdown,
  ArrowsClockwise, CalendarDots, SprayBottle, SunHorizon, Crown, House, Cactus, Diamond, Dna, Scissors, Bug,
  Snowflake, Fire, Moon, Mountains,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon as PIcon } from "@phosphor-icons/react";

const MAP: Record<string, PIcon> = {
  Sun, Leaf, Drop, Flask, Thermometer, PottedPlant, Flower, Plant, Sparkle, ClockCountdown,
  ArrowsClockwise, CalendarDots, SprayBottle, SunHorizon, Crown, House, Cactus, Diamond, Dna, Scissors, Bug,
  Snowflake, Fire, Moon, Mountains,
};

export default function Icon({ name, size = 22, weight = "duotone" }: { name: string; size?: number; weight?: "duotone" | "bold" | "fill" | "regular" }) {
  const C = MAP[name] ?? Sparkle;
  return <C size={size} weight={weight} />;
}
