import { createPlugin, replaceRange } from "ts-macro";
import ts from "typescript";

export type TargetDefinition =
	| string
	| [name: string, tagLocation: (string | number)[]];

export type RelayPluginOptions = {
	targets?: {
		presets?: TargetPreset[];
		custom?: TargetDefinition[];
	};
};

type TargetPreset = "runtime" | "react" | "solid";

const targetPresets: Record<TargetPreset, TargetDefinition[]> = {
	runtime: [
		["fetchQuery", [1]],
		["commitMutation", [1, "mutation"]],
		["requestSubscription", [1, "subscription"]],
	],
	react: [
		"useLazyLoadQuery",
		"usePreloadedQuery",
		"createQueryLoader",
		"useFragment",
		"useRefetchableFragment",
		"usePaginationFragment",
		"useMutation",
		"useSubscription",
	],
	solid: [
		"createLazyLoadQuery",
		"createPreloadedQuery",
		"createQueryLoader",
		"createFragment",
		"createRefetchableFragment",
		"createPaginationFragment",
		"createMutation",
		"createSubscription",
	],
};

export const relayPlugin = createPlugin<RelayPluginOptions>(
	({ ts }, userOptions) => {
		const options: RelayPluginOptions = Object.assign(
			{ targets: { presets: ["runtime"] } },
			userOptions,
		);

		const targets: Exclude<TargetDefinition, string>[] = [
			...(options.targets?.presets?.flatMap(
				(preset) => targetPresets[preset],
			) ?? []),
			...(options.targets?.custom ?? []),
		].map((v) => (typeof v === "string" ? [v, [0]] : v));

		return {
			name: "ts-macro-relay",
			resolveVirtualCode({ ast, codes }) {
				ts.forEachChild(ast, function walk(node) {
					try {
						if (!ts.isCallExpression(node)) return;
						const text = node.expression.getText(ast);
						const target = targets.find(([name]) => text.startsWith(name));
						if (!target) return;

						let current: ts.Node | ts.NodeArray<ts.Node> = node.arguments;
						for (const path of target[1]) {
							if (typeof path === "number") {
								if (!("length" in current)) return;
								current = current[path];
							} else {
								if (
									"length" in current ||
									!ts.isObjectLiteralExpression(current)
								)
									return;
								const prop: ts.ObjectLiteralElementLike | undefined =
									current.properties.find((p) => p.name?.getText(ast) === path);
								if (!prop || !ts.isPropertyAssignment(prop)) return;
								current = prop.initializer;
							}
						}

						if (
							!("length" in current) &&
							ts.isTaggedTemplateExpression(current) &&
							current.tag.getText(ast) === "graphql"
						) {
							const decl = extractDeclaration(current.template.getText(ast));
							if (!decl) return;
							replaceRange(
								codes,
								node.arguments.pos - 1,
								node.arguments.pos - 1,
								`<import("./__generated__/${decl.name}.graphql").${decl.name}>`,
							);
						}
					} finally {
						ts.forEachChild(node, walk);
					}
				});
			},
		};
	},
);

const extractDeclaration = (query: string) => {
	const [, type, name] =
		query.match(
			/\s(query|fragment|mutation|subscription)\s+([A-Za-z_][A-Za-z_0-9]*)\s*[({]/,
		) ?? [];
	if (!name) return null;
	return {
		type: type as "query" | "fragment" | "mutation" | "subscription",
		name,
	};
};
