// import adapter from '@sveltejs/adapter-auto';
// import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// /** @type {import('@sveltejs/kit').Config} */
// const config = {
// 	// Consult https://svelte.dev/docs/kit/integrations
// 	// for more information about preprocessors
// 	preprocess: vitePreprocess(),
// 	kit: { adapter: adapter() }
// };

// export default config;

// svelte.config.js
import adapter from '@sveltejs/adapter-node';

export default {
	kit: {
		adapter: adapter()
	}
};
