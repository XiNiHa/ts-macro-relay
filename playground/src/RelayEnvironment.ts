import {
	Environment,
	type FetchFunction,
	Network,
	RecordSource,
	Store,
} from "relay-runtime";

const HTTP_ENDPOINT = "https://graphqlpokemon.favware.tech/v8";

const fetchFn: FetchFunction = async (request, variables) => {
	const resp = await fetch(HTTP_ENDPOINT, {
		method: "POST",
		headers: {
			Accept:
				"application/graphql-response+json; charset=utf-8, application/json; charset=utf-8",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query: request.text,
			variables,
		}),
	});

	return await resp.json();
};

function createRelayEnvironment() {
	return new Environment({
		network: Network.create(fetchFn),
		store: new Store(new RecordSource()),
	});
}

export const RelayEnvironment = createRelayEnvironment();
