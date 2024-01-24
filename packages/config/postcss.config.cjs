// module.exports = {
// 	plugins: {
// 		tailwindcss: {},
// 		autoprefixer: {},
// 	},
// };

// postcss.config.js
// https://stackoverflow.com/questions/64032166/tailwindcss-not-working-with-next-js-what-is-wrong-with-the-configuration/67567736#67567736
const { join } = require('path');

module.exports = {
	plugins: {
		tailwindcss: {
			config: join(__dirname, 'tailwind.config.cjs'),
		},
		autoprefixer: {},
	},
};
