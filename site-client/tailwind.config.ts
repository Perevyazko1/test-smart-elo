import {Config} from "tailwindcss";
import plugin from "tailwindcss/plugin";

import {COLORS} from "./src/constants/color.constants";

const spacing: { [key: string]: string } = {};
const fontSize: { [key: string]: string } = {};

for (let i = 0; i <= 100; i++) {
    spacing[i.toString()] = `${i / 16}rem`;
    fontSize[i.toString()] = `${i / 16}rem`;
}

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: COLORS,
            transitionTimingFunction:
                {
                    DEFAULT: 'ease-in-out'
                }
            ,
            transitionDuration: {
                DEFAULT: '250ms'
            },
            keyframes: {
                fadeIn: {
                    '0%': {transform: 'translateX(150%)'},
                    '100%': {transform: 'translateX(0)'},
                },
            },
            animation: {
                fade: 'fadeIn 0.3s ease-in-out',
            },
            cursor: {
                'close': 'url(/icons/close.svg), pointer',
            },
            fontSize,
        },
        spacing,
        screens: {
            sm: "48em",       // < 768px
            md: "87.5em",     // < 1400px
            lg: "120em",    // < 1920px
            xl: "175em",   // < 2800px
        },
    },
    plugins: [
        plugin(function ({matchUtilities}) {
            matchUtilities(
                {
                    w: (value) => ({
                        width: `${parseFloat(value) / 16}rem`,
                    }),
                    h: (value) => ({
                        height: `${parseFloat(value) / 16}rem`,
                    }),
                },
                {type: 'length', supportsNegativeValues: true}
            );
        }),
    ],
} satisfies Config;
