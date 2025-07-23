import { heroui } from "@heroui/react";
export default heroui({
	prefix: "heroui", // prefix for themes variables
	addCommonColors: false, // override common colors (e.g. "blue", "green", "pink").
	defaultTheme: "light", // default theme from the themes object
	defaultExtendTheme: "light", // default theme to extend on custom themes
	layout: {}, // common layout tokens (applied to all themes)
	themes: {
		light: {
			layout: {}, // light theme layout tokens
			colors: {
				primary: {
					DEFAULT: "#2f90b9",
				},
				secondary: {
					DEFAULT: "#0579A1",
				},
				background: "#FFFFFF",
			}, // light theme colors
		},
		dark: {
			layout: {}, // dark theme layout tokens
			colors: {}, // dark theme colors
		},
		// ... custom themes
	},
});
