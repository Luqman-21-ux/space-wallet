"use client";
// beui.dev/components/blocks/card-folder

import { EllipsisVertical } from "lucide-react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  EASE_IN_OUT,
  EASE_OUT,
  SPRING_LAYOUT,
  SPRING_PRESS,
} from "@/lib/ease";
import { cn } from "@/lib/utils";

// The two purse layers collapse as one material surface after the card starts
// moving, then reverse immediately so closing feels like the card is caught.
const PURSE_MORPH_TRANSITION = {
  duration: 0.28,
  ease: EASE_IN_OUT,
} as const;
const PURSE_REDUCED_TRANSITION = {
  duration: 0.16,
  ease: EASE_OUT,
} as const;

export interface CardFolderProps {
  title: string;
  walletLogo?: ReactNode;
  cardNumber: string;
  expiry: string;
  cvv: string;
  card: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  detailsVisible?: boolean;
  defaultDetailsVisible?: boolean;
  onDetailsVisibleChange?: (visible: boolean) => void;
  onClick?: () => void;
  onAction?: () => void;
  ariaLabel?: string;
  actionLabel?: string;
  disabled?: boolean;
  className?: string;
  cardClassName?: string;
}

/**
 * A landscape card tucked into an animated folder sleeve. Pressing the folder
 * lifts the card forward while the purse compresses into its bottom seam; a
 * separate privacy control reveals its number and CVV.
 */
export function CardFolder({
  title,
  walletLogo,
  cardNumber,
  expiry,
  cvv,
  card,
  open,
  defaultOpen = false,
  onOpenChange,
  detailsVisible,
  defaultDetailsVisible = false,
  onDetailsVisibleChange,
  onClick,
  onAction,
  ariaLabel,
  actionLabel,
  disabled = false,
  className,
  cardClassName,
}: CardFolderProps) {
  const reduce = useReducedMotion();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalDetailsVisible, setInternalDetailsVisible] = useState(
    defaultDetailsVisible,
  );
  const openControlled = open !== undefined;
  const detailsControlled = detailsVisible !== undefined;
  const isOpen = open ?? internalOpen;
  const areDetailsVisible = detailsVisible ?? internalDetailsVisible;
  const transition = reduce ? { duration: 0 } : SPRING_LAYOUT;
  const normalizedCardNumber = cardNumber.replace(/\D/g, "");
  const visibleLastFour = normalizedCardNumber.slice(-4).padStart(4, "•");
  const revealedCardNumber =
    normalizedCardNumber.match(/.{1,4}/g)?.join(" ") ?? visibleLastFour;
  const maskedCvv = "•".repeat(Math.max(3, cvv.length));
  const defaultAriaLabel = `${isOpen ? "Close" : "Open"} ${title}, card ending in ${visibleLastFour}`;
  const progress = useMotionValue(isOpen ? 1 : 0);
  const cardTransform = useTransform(progress, (value) => {
    const boundedProgress = Math.min(1, Math.max(0, value));
    const lift = Math.sin(Math.PI * boundedProgress);
    return `translateY(${-8 * lift}%) scale(${1 + 0.01 * lift})`;
  });
  const backTransform = useTransform(
    progress,
    [0, 1],
    ["translateY(0%) scaleY(1)", "translateY(18%) scaleY(0.18)"],
  );
  const frontTransform = useTransform(
    progress,
    [0, 1],
    ["translateY(0%) rotateX(0deg)", "translateY(18%) rotateX(-72deg)"],
  );
  const purseOpacity = useTransform(progress, [0, 0.76, 1], [1, 1, 0]);

  useEffect(() => {
    const controls = animate(
      progress,
      isOpen ? 1 : 0,
      reduce ? { duration: 0 } : PURSE_MORPH_TRANSITION,
    );
    return () => controls.stop();
  }, [isOpen, progress, reduce]);

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (disabled) return;
      if (!openControlled) setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [disabled, onOpenChange, openControlled],
  );

  const handleClick = () => {
    setOpen(!isOpen);
    onClick?.();
  };

  const toggleDetails = () => {
    if (disabled) return;
    const nextVisible = !areDetailsVisible;
    if (!detailsControlled) setInternalDetailsVisible(nextVisible);
    onDetailsVisibleChange?.(nextVisible);
  };

  return (
    <div
      data-open={isOpen ? "true" : "false"}
      data-details-visible={areDetailsVisible ? "true" : "false"}
      className={cn(
        "relative aspect-[1029/592] w-96 max-w-full select-none [perspective:1200px]",
        className,
      )}
    >
      <motion.button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel ?? defaultAriaLabel}
        aria-expanded={isOpen}
        onClick={handleClick}
        whileTap={reduce || disabled ? undefined : { scale: 0.96 }}
        transition={reduce ? { duration: 0 } : SPRING_PRESS}
        className="absolute inset-0 block rounded-[22px] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        <motion.span
          data-slot="card-folder-back"
          aria-hidden="true"
          initial={false}
          animate={reduce ? { opacity: isOpen ? 0 : 1 } : undefined}
          transition={PURSE_REDUCED_TRANSITION}
          style={
            reduce
              ? undefined
              : { opacity: purseOpacity, transform: backTransform }
          }
          className="absolute inset-x-0 bottom-0 top-[10%] rounded-[22px] border border-foreground/10 bg-background [transform-origin:center_bottom]"
        />

      </motion.button>
        <motion.div
          aria-hidden={!isOpen}
          inert={!isOpen}
          initial={false}
          animate={
            reduce ? { transform: "translateY(0%) scale(1)" } : undefined
          }
          style={{ transform: reduce ? undefined : cardTransform, pointerEvents: isOpen ? "auto" : "none" }}
          className={cn(
            "absolute left-[4.7%] right-[4.7%] top-0 z-10 aspect-[1.586/1] rounded-xl [transform-origin:center_bottom] will-change-transform",
            cardClassName,
          )}
        >
          {card}
        </motion.div>

      <motion.span
        aria-hidden={isOpen}
        inert={isOpen}
        initial={false}
        animate={reduce ? { opacity: isOpen ? 0 : 1 } : undefined}
        transition={PURSE_REDUCED_TRANSITION}
        style={
          reduce
            ? undefined
            : { opacity: purseOpacity, transform: frontTransform }
        }
        className="pointer-events-none absolute inset-x-0 bottom-0 top-1/2 z-20 [backface-visibility:hidden] [transform-origin:center_bottom]"
      >
          <svg
            aria-hidden="true"
            viewBox="0 0 384 110"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible"
          >
            <path
              d="M0 17C15 7 31 4 49 4H87C110 4 126 17 144 32L158 44C176 59 206 59 225 43L240 30C257 16 271 4 295 4H335C354 4 370 8 384 18V88.38C384 100.32 374.32 110 362.38 110H21.62C9.68 110 0 100.32 0 88.38Z"
              fill="var(--background)"
              stroke="var(--foreground)"
              strokeOpacity="0.12"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M10 21C22 13 35 11 51 11H85C105 11 120 23 137 37L153 50C175 68 208 68 231 49L246 36C262 23 275 11 297 11H333C350 11 363 14 374 22V83.38C374 93.11 366.11 101 356.38 101H27.62C17.89 101 10 93.11 10 83.38Z"
              fill="none"
              stroke="var(--foreground)"
              strokeDasharray="5 5"
              strokeLinecap="round"
              strokeOpacity="0.22"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <span className="absolute inset-x-[5%] inset-y-0 z-10 flex min-w-0 flex-col justify-between py-4">
            <span aria-hidden="true" className="size-10 shrink-0" />
            <span className="flex min-w-0 items-end justify-between gap-4">
              <span className="flex min-w-0 flex-col gap-1" style={walletLogo ? { transform: "translateY(-16px)" } : undefined}>
                <span style={{fontSize:9,fontWeight:500,letterSpacing:"0.15em",color:"#77777d"}}>YOUR WALLET</span>
                <span className="truncate text-lg font-medium leading-tight text-foreground">{walletLogo ?? title}</span>
              </span>
              <span className="truncate text-xs font-medium tracking-[0.08em] text-foreground" style={{ transform: "translateY(-16px)" }}>
                KAKASHI SENSEI
              </span>
            </span>
          </span>
      </motion.span>

      {onAction ? (
        <motion.button
          type="button"
          disabled={disabled}
          aria-label={actionLabel ?? `Open actions for ${title}`}
          onClick={onAction}
          animate={{ y: isOpen && !reduce ? -14 : 0 }}
          whileTap={reduce || disabled ? undefined : { scale: 0.96 }}
          transition={transition}
          className="absolute right-[2.6%] top-[10%] z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-white/65 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <EllipsisVertical className="size-4" aria-hidden="true" />
        </motion.button>
      ) : null}
    </div>
  );
}
