module.exports = {
    purge: {
        // enabled: true,
        content: ["./src/**/*.js"],
    },
    plugins: [require("@tailwindcss/forms")],
    theme: {
        fontFamily: {
            InterBold: ["Inter Bold, sans-serif"],
            InterRegular: ["Inter Regular, sans-serif"],
        },
        extend: {
            keyframes: {
                "spin-backwards": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(-360deg)" },
                },
            },
            animation: {
                "spin-backwards": "spin-backwards 1s linear infinite",
            },
        },
    },
};
