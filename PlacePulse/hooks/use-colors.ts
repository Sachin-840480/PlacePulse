import { useColorScheme } from '@/hooks/use-color-scheme';
import { colorsScheme } from '../constants/colors';

export function useColors() {
  const scheme = useColorScheme() ?? 'light';
  return colorsScheme[scheme];
}