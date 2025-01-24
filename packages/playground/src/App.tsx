import { graphql, useLazyLoadQuery } from "react-relay";

function App() {
	const query = useLazyLoadQuery(
		graphql`
			query AppQuery {
				getPokemon(pokemon: pikachu) {
					key
				}
			}
		`,
		{},
	);

	return <>{query.getPokemon.key}</>;
}

export default App;
