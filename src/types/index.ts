import { Variant, Variants } from 'framer-motion';

export interface AnimationProps {
    animateExit: boolean;
    duration?: number;
    delay?: number;
}

export type DotAnimationState =
    | 'fadeIn'
    | 'wiggle1'
    | 'pause'
    | 'wiggle2'
    | 'secondPause'
    | 'expand'
    | 'contract';

export interface DotVariants extends Variants {
    hidden: Variant;
    fadeIn: Variant;
    wiggle1: Variant;
    pause: Variant;
    wiggle2: Variant;
    secondPause: Variant;
    expand: Variant;
    contract: Variant;
}

export interface HomePageMenuProps extends Pick<AnimationProps, 'animateExit'> {
    onAboutClick: () => void;
}
export interface HomePageBackgroundProps {
    animateExit: boolean;
}
export type HomePageTitleProps = Pick<AnimationProps, 'animateExit'>
export type HomePageFooterProps = Pick<AnimationProps, 'animateExit'>
export type HomePageSocialsProps = Pick<AnimationProps, 'animateExit'>

export interface IntroOverlayProps {
    onFinish?: () => void;
}
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

export type HomeProps = Record<string, never>;
export type AboutProps = Record<string, never>;

export type NavigationHandler = () => void;
export type AnimationCallback = () => void;
export type ComponentProps<T> = T extends React.FC<infer P> ? P : never;