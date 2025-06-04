export enum TIMER {
  isRunning = 'Running',
  isPaused = 'Paused',
  isStopped = 'Stopped',
}

export enum OPTION_TYPE {
  isFocusOn = 'focus-on',
  isShortBreak = 'short-break',
  isLongBreak = 'long-break',
}

export interface QuotesType {
  a: string,
  c: string,
  h: string,
  q: string,
}

export type QuotesArray = QuotesType[];

export interface USER_INPUT {
  focusDuration: number,
  shortBreakDuration: number,
  longBreakDuration: number,
  interval: number,
}

export interface GLOBAL_CONFIG {
  duration: number,
  totalDuration: number,
  remainingDuration: number,
  states: {
    currentTimerStatus: TIMER,
    currentOptionType: OPTION_TYPE,
  },
  timerInterval: number | undefined,
  currentSelected: HTMLButtonElement,
  previousSelected: HTMLButtonElement | null,
  count: number,
  totalCount: number,
  maxCount: number,
  randomIndex: number,
  NOTIFICATION_TIMEOUT: number,
  COUNTDOWN_INTERVAL: number,
  SECONDS: number,
  AUTOPLAY_DELAY: number,
}

// specific to input elements event.target
export function isInputELement(element: EventTarget | null): element is HTMLInputElement {
  return element instanceof HTMLInputElement;
}

// check the element value of event.target for any type
export function isElementOfType<T extends HTMLElement>(target: EventTarget | null, type: { new(): T }): target is T {
  return target instanceof type
}

// generic type function for querying elements
export function getRequiredElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error('Element not found.')
  }
  return element;
}

// check if element exists to avoid using null assertions
export function verifyElement<T extends HTMLElement>(element: T | null): T {
  if (!element) throw new Error('Element not found.')
  return element;
}