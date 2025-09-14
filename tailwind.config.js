// // tailwind.config.js
// import { addDynamicIconSelectors } from '@iconify/tailwind';
// import flowbite from 'flowbite/plugin';

// export default {
// 	content: [
// 		'./src/**/*.{html,js,svelte,ts}',
// 		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',
// 		'./node_modules/flowbite/**/*.{js,svelte,ts}'
// 	],
// 	theme: {
// 		extend: {}
// 	},
// 	plugins: [flowbite, addDynamicIconSelectors()],
// 	safelist: ['icon-[flowbite:file-code-solid]', 'icon-[flowbite:table-row-solid]']
// };

import { addDynamicIconSelectors } from '@iconify/tailwind';
import flowbite from 'flowbite/plugin';

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite/**/*.{js,svelte,ts}'
	],
	theme: { extend: {} },
	plugins: [flowbite, addDynamicIconSelectors()],
	safelist: [
		'icon-[flowbite:file-code-solid]',
		'icon-[flowbite:table-row-solid]',
		'icon-[flowbite:circle-plus-outline]',
		'icon-[flowbite--close-circle-outline]',
		'icon-[cib:lets-encrypt]'
	]
};
