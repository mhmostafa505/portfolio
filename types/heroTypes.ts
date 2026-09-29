export interface heroContentsType {
  NAME: string;
  ROLES: string[];
  FLOAT_TAGS: {
    text: string;
    color: string;
    border: string;
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    duration: string;
    delay: string;
    url: string;
  }[];
  SCRAMBLE_CHARS: string;
  TYPE_SPEED: number;
  DELETE_SPEED: number;
  HOLD_TIME: number;
  PAUSE_BEFORE_NEXT: number;
  DOTS_DURATION: number;
}
