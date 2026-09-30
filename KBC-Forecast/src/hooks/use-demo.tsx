import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';

import { forecast, GSM_DAY, initialChoices, type ChoiceKey, type Choices } from '@/data/demo';

type DemoState = {
  choices: Choices;
  model: ReturnType<typeof forecast>;
  /** The same month without tonight's outing or the phone, used for the delta badge and the chat. */
  baseline: ReturnType<typeof forecast>;
  selectedDay: number;
  paymentsVisible: boolean;
  tipDismissed: boolean;
  toast: string | null;
  toggleChoice: (key: ChoiceKey) => void;
  setChoice: (key: ChoiceKey, value: boolean) => void;
  selectDay: (index: number) => void;
  togglePayments: () => void;
  dismissTip: () => void;
  notify: (message: string) => void;
  reset: () => void;
};

const DemoContext = createContext<DemoState | null>(null);

export function DemoProvider({ children }: PropsWithChildren) {
  const [choices, setChoices] = useState(initialChoices);
  const [selectedDay, setSelectedDay] = useState(0);
  const [paymentsVisible, setPaymentsVisible] = useState(true);
  const [tipDismissed, setTipDismissed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const setChoice = useCallback((key: ChoiceKey, value: boolean) => {
    setChoices(previous => ({ ...previous, [key]: value }));
    // Buying the phone jumps to the stormy day; undoing it returns to today (mockup behaviour).
    if (key === 'gsm') setSelectedDay(value ? GSM_DAY : 0);
  }, []);

  const toggleChoice = useCallback((key: ChoiceKey) => setChoice(key, !choices[key]), [choices, setChoice]);

  const notify = useCallback((message: string) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  const reset = useCallback(() => {
    setChoices(initialChoices());
    setSelectedDay(0);
    setPaymentsVisible(true);
    setTipDismissed(false);
  }, []);

  const value = useMemo<DemoState>(() => ({
    choices,
    model: forecast(choices),
    baseline: forecast({ uitgaan: false, gsm: false, sparen: choices.sparen }),
    selectedDay,
    paymentsVisible,
    tipDismissed,
    toast,
    toggleChoice,
    setChoice,
    selectDay: setSelectedDay,
    togglePayments: () => setPaymentsVisible(visible => !visible),
    dismissTip: () => setTipDismissed(true),
    notify,
    reset,
  }), [choices, selectedDay, paymentsVisible, tipDismissed, toast, toggleChoice, setChoice, notify, reset]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used inside <DemoProvider>');
  return context;
}
