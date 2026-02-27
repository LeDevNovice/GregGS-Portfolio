export type SectionId = 'about' | 'publications' | 'projects';

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

export interface IntroOverlayProps {}

export interface IntroTitleProps {
  text: string;
  visible: boolean;
  skipAnimation: boolean;
  handleTitleAnimationComplete: () => void;
}

export interface IntroEnterMessageProps {
  isTouchDevice: boolean;
}

export interface OverlayMenuProps {
  onClose: () => void;
  onNavigate: (section: SectionId) => void;
  isVisible: boolean;
}

export interface ContentPanelProps {
  isVisible: boolean;
  section: SectionId | null;
  onClosed: () => void;
}

export interface PanelDotProps {
  onClick: () => void;
}

export type AboutProps = Record<string, never>;

export type NavigationHandler = () => void;
export type AnimationCallback = () => void;
export type ComponentProps<T> = T extends React.FC<infer P> ? P : never;