# ts-macro-relay

[TS Macro](https://github.com/ts-macro/ts-macro) plugin for Relay.

## Features

- Automatic type inference for `graphql` tag usages with Relay

  Limitations:

  - Doesn't support `artifactDirectory` in Relay config (TODO)

## Example

```ts
import { fetchQuery, graphql } from "relay-runtime";
import { environment } from "./RelayEnvironment";

fetchQuery(
  environment,
  graphql`
    query AppQuery($variable: String!) {
      foo(name: $variable)
    }
  `,
  {
    variable: "bar", // the types of variables are enforced by this plugin
  }
).subscribe({
  next: (data) => {
    console.log(data.foo); // this is also automatically inferred
  },
});
```

## Configuring

```ts
// tsm.config.ts
import { relayPlugin } from "ts-macro-relay";

export default {
  plugins: [
    relayPlugin({
      targets: {
        presets: ["react", "runtime"], // select presets that match the packages you're using
        custom: [], // you can also specify custom functions that can be detected as a Relay function call
      },
    }),
  ],
};
```
