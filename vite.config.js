import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";

export default defineConfig({
	base: process.env.IS_DEV !== "true" ? "./" : "/",
	server: {
		port: 5184,
		strictPort: true,
	},
	build: {
		outDir: "ui-build",
	},
	plugins: [
		svelte({
			preprocess: preprocess(),
		}),
	],
});
