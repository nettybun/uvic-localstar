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
    },
};
