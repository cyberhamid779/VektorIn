import { useDarkMode } from "./useTheme";

export function useDarkClasses() {
  const dark = useDarkMode();

  return {
    dark,
    card: dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100",
    cardHover: dark ? "hover:shadow-gray-900" : "hover:shadow-md",
    text: dark ? "text-gray-100" : "text-gray-900",
    textSecondary: dark ? "text-gray-300" : "text-gray-700",
    textMuted: dark ? "text-gray-400" : "text-gray-500",
    textFaint: dark ? "text-gray-500" : "text-gray-400",
    input: dark ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "bg-white border-gray-200 text-gray-700 placeholder-gray-300",
    inputAlt: dark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-gray-50 border-gray-200 text-gray-700",
    border: dark ? "border-gray-700" : "border-gray-100",
    borderLight: dark ? "border-gray-700/50" : "border-gray-50",
    surface: dark ? "bg-gray-800/50" : "bg-gradient-to-r from-gray-50 to-white",
    heading: dark ? "text-white" : "text-gray-900",
    page: dark ? "text-gray-100" : "text-gray-900",
  };
}
