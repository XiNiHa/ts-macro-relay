import { type PluginReturn, createPlugin, replaceRange } from "ts-macro";
import type TS from "typescript";

export type RelayPluginOptions = {
	targets: ("runtime" | "react" | "solid")[];
};

export const relayPlugin: PluginReturn<RelayPluginOptions> =
	createPlugin<RelayPluginOptions>(({ ts, compilerOptions }, userOptions) => {
		const options: RelayPluginOptions = Object.assign(
			{ targets: ["runtime"] },
			userOptions,
		);

		return {
			name: "ts-macro-relay",
			resolveVirtualCode({ ast, codes }) {
				ts.forEachChild(ast, (node) => walk(node, ast));

				function walk(node: TS.Node, parent: TS.Node) {
					if (options.targets.includes("react")) {
						if (ts.isCallExpression(node)) {
							const text = node.expression.getText(ast);
							if (
								[
									"useLazyLoadQuery",
									"usePreloadedQuery",
									"useFragment",
									"useRefetchableFragment",
									"usePaginationFragment",
									"useMutation",
									"useSubscription",
								].some((fn) => text.startsWith(fn))
							) {
								if (
									ts.isTaggedTemplateExpression(node.arguments[0]) &&
									node.arguments[0].tag.getText(ast) === "graphql"
								) {
									const declName = extractDeclarationName(
										node.arguments[0].template.getText(ast),
									);
									replaceRange(
										codes,
										node.arguments.pos - 1,
										node.arguments.pos - 1,
										`<import("./__generated__/${declName}.graphql").default>`,
									);
								}
							}
						}
					}
				}
			},
		};
	});

const extractDeclarationName = (query: string) => {
	const [, type, name] =
		query.match(
			/\s(query|fragment|mutation|subscription)\s+([A-Za-z_][A-Za-z_0-9]*)\s*{/,
		) ?? [];
	if (!name) return null;
	return {
		type: type as "query" | "fragment" | "mutation" | "subscription",
		name,
	};
};
