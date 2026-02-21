import { Variant, Variants } from 'framer-motion';

// --- Sections ---

export type SectionId = 'about' | 'publications' | 'projects';

// --- Dot Animation ---

export type DotAnimationState =
    | 'fadeIn'
    | 'idle'
    | 'wiggle1'
    | 'pause'
    | 'wiggle2'
    | 'secondPause'
    | 'expand'
    | 'expanded'
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
    expanded: Variant;
    contract: Variant;
}

// --- IntroOverlay ---

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

// --- Overlay Menu ---

export interface OverlayMenuProps {
    onClose: () => void;
    onNavigate: (section: SectionId) => void;
    isVisible: boolean;
}

// --- Content Panel ---

export interface ContentPanelProps {
    isVisible: boolean;
    section: SectionId | null;
    onClosed: () => void;
}

export interface PanelDotProps {
    onClick: () => void;
}

// --- Pages ---

export type AboutProps = Record<string, never>;

// --- Utilities ---

export type NavigationHandler = () => void;
export type AnimationCallback = () => void;
export type ComponentProps<T> = T extends React.FC<infer P> ? P : never;