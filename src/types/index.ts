import { Variant, Variants } from 'framer-motion';

// --- Dot Animation ---

export type DotAnimationState =
    | 'fadeIn'
    | 'idle'
    | 'wiggle1'
    | 'pause'
    | 'wiggle2'
    | 'secondPause'
    | 'expand'
    | 'contract';

export interface DotVariants extends Variants {
    hidden: Variant;
    fadeIn: Variant;
    idle: Variant;
    wiggle1: Variant;
    pause: Variant;
    wiggle2: Variant;
    secondPause: Variant;
    expand: Variant;
    contract: Variant;
}

// --- IntroOverlay ---

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IntroOverlayProps {}

export interface IntroTitleProps {
    text: string;
    handleTitleAnimationComplete: () => void;
}

export interface IntroDotProps {
    variant: DotVariants;
    animationState: DotAnimationState;
    handleDotAnimationComplete: (animationName: DotAnimationState) => void;
}

export interface IntroEnterMessageProps {
    isTouchDevice: boolean;
}

// --- Overlay Menu ---

export interface OverlayMenuProps {
    onClose: () => void;
    isVisible: boolean;
}

// --- Pages ---

export type AboutProps = Record<string, never>;

// --- Utilities ---

export type NavigationHandler = () => void;
export type AnimationCallback = () => void;
export type ComponentProps<T> = T extends React.FC<infer P> ? P : never;