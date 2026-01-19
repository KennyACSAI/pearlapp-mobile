import { colors } from "@/constants";

export function useThemeColor(
  _props: Record<string, string> | undefined,
  colorName: keyof typeof colors
) {
  return colors[colorName];
}
