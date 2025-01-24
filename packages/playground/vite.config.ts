import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import relay from "vite-plugin-relay";

// https://vite.dev/config/
export default defineConfig({
	plugins: [relay, react()],
});
