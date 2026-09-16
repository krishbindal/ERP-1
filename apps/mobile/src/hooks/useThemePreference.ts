import { createContext, useContext } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

// ─── Context ─────────────────────────────────────────────────────────────────

export type ThemeContextValue = {
  colorScheme: ColorSchemeName;
  setColorScheme: (scheme: ColorSchemeName) => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: Appearance.getColorScheme(),
  setColorScheme: () => {},
});

export function useThemePreference() {
  return useContext(ThemeContext);
}
