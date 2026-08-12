import { create } from "zustand";

/**
 * Видимость основной десктоп-навигации (скролл вниз / моб. меню).
 * Для `position: fixed` элементов вне `<nav>`, которые должны «подтягиваться» к верху экрана.
 */
type NavChromeState = {
  /** true, когда на `<nav>` висит класс `nav--hidden` (translateY). */
  mainNavCollapsed: boolean;
  setMainNavCollapsed: (value: boolean) => void;
  /** Блокировка/скрытие chrome (модалки и т.п.). */
  chromeLocked: boolean;
  lockChrome: () => void;
  unlockChrome: () => void;
};

export const useNavChromeStore = create<NavChromeState>((set) => ({
  mainNavCollapsed: false,
  setMainNavCollapsed: (value) => set({ mainNavCollapsed: value }),
  chromeLocked: false,
  lockChrome: () => set({ chromeLocked: true }),
  unlockChrome: () => set({ chromeLocked: false }),
}));
