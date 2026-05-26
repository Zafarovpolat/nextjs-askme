import { create } from "zustand";

export type SystemToastKind = "success" | "error";

export type SystemToast = {
  id: number;
  message: string;
  kind: SystemToastKind;
};

const MAX_VISIBLE = 3;
const VISIBLE_MS = 3000;

let idSeq = 1;

type SystemToastState = {
  toasts: SystemToast[];
  pushToast: (message: string, kind?: SystemToastKind) => void;
  dismissToast: (id: number) => void;
};

export const useSystemToastStore = create<SystemToastState>((set) => ({
  toasts: [],
  pushToast: (message, kind = "success") => {
    const trimmed = message.trim();
    const text =
      trimmed ||
      (kind === "error" ? "Произошла ошибка" : "Готово");
    const id = idSeq++;
    set((s) => ({
      toasts: [{ id, message: text, kind }, ...s.toasts].slice(0, MAX_VISIBLE),
    }));
  },
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Вызов вне React (обработчики, хуки). */
export function showSystemToast(
  message: string,
  kind: SystemToastKind = "success",
): void {
  useSystemToastStore.getState().pushToast(message, kind);
}

export { VISIBLE_MS as SYSTEM_TOAST_VISIBLE_MS };
