module.exports = {
	content: ["./src/pages/**/*.{html,js,ts,jsx,tsx}"],
	theme: {
		extend: {},
	},
	variants: {},
	plugins: [require("@tailwindcss/typography"), require("daisyui")],
	daisyui: {
		themes: ["emerald", "cupcake"],
	},
};