import { Variant, Variants } from 'framer-motion';

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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IntroOverlayProps {}

export interface IntroTitleProps {
    text: string;
    visible: boolean;
    skipAnimation: boolean;
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

export interface OverlayMenuProps {
    onClose: () => void;
    isVisible: boolean;
}

export type AboutProps = Record<string, never>;

export type NavigationHandler = () => void;
export type AnimationCallback = () => void;
export type ComponentProps<T> = T extends React.FC<infer P> ? P : never;