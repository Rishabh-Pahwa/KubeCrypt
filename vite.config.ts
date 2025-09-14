import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';
// import { sveltekit } from '@sveltejs/kit/vite';
// import { defineConfig } from 'vite';
// export default defineConfig({
// 	plugins: [sveltekit()],
// 	css: {
// 		postcss: './postcss.config.cjs'
// 	}
// });
import { sveltekit } from '@sveltejs/kit/vite';
import Icons from 'unplugin-icons/vite';

export default {
	plugins: [sveltekit(), Icons({ compiler: 'svelte', autoInstall: true }), devtoolsJson()]
};
