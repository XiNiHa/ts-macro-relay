import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RelayEnvironmentProvider } from "react-relay";
import App from "./App.tsx";
import { RelayEnvironment } from "./RelayEnvironment";

// biome-ignore lint/style/noNonNullAssertion: guaranteed to be present
createRoot(document.getElementById("root")!).render(
	<RelayEnvironmentProvider environment={RelayEnvironment}>
		<StrictMode>
			<App />
		</StrictMode>
	</RelayEnvironmentProvider>,
);
