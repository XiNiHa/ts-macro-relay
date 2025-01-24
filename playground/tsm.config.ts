import { relayPlugin } from "ts-macro-relay";

export default {
  plugins: [relayPlugin({ targets: { presets: ["react", "runtime"] } })],
};
