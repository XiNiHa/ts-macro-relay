import { graphql, useLazyLoadQuery } from "react-relay";

const q = graphql`
	query AppQuery {
		getPokemon(pokemon: pikachu) {
			key
		}
	}
`;

function App() {
	const query = useLazyLoadQuery(q, {});

	return <>{query.getPokemon.key}</>;
}

export default App;
