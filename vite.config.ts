import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@config": resolve(__dirname, "./src/config"),
			"@scenes": resolve(__dirname, "./src/scenes"),
			"@prefabs": resolve(__dirname, "./src/prefabs"),
			"@systems": resolve(__dirname, "./src/systems"),
			"@data": resolve(__dirname, "./src/data"),
		},
	},
	server: {
		port: 3000,
		open: true,
	},
	build: {
		outDir: "dist",
		assetsDir: "assets",
		sourcemap: true,
	},
});
