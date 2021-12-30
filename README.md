# Next.js + NATS + Protobuf + Typescript demo ap

This is a toy example of a chat application which shows how to integrate a Next.js app with
a backend when the communication with the back-end is done via protobuf messages over NATS.

To add:

- Protobuf integration
- K8s deployment
- HTTP/2 ingress for K8s

## First steps

- `npm install`
- Run a NATS 2.X server with JetStream enabled, e.g., `docker run --rm -p 4222:4222 nats:2.6.6 -js`
- `npm run dev`
- Visit `http://localhost:3000` and enter chat messages (from one or multiple browsers)
- Log on and off and see that metadata is persisted in NATS JetStream, whereas messages
  are not.
- Restart the server and log in again to be sure that metadata persistence works.

## Limits

This is just a simple prototype, some aspects are definitively not production-ready:

- User authentication is not done at all for now, the REST calls to the back-end just supply
  the username as a URL parameter (GET) or content (POST). This would certainly be different
  in a real-world setup.
- JetStream subscriptions are left dangling (dangling consumers) in case of next.js server
  terminations (the SSE stream should be closed properly in this case, currently it is not).

## Design decisions

### Follow next.js logic as far as possible

#### Server setup / teardown

next.js offers the option to use a custom server but at the same time 
[advises against doing this because it disables some performance optimizations][cust-server].
This means that we do not have any dedicated setup or teardown phase for things like the NATS 
connection. Instead, we use lazy initialization for setup and [node shutdown hooks][hooks] for
teardown. This enables us to benefit from the optimizations in the default next.js server and
keep the option to later move the code to serverless environments.

[cust-server]: https://nextjs.org/docs/advanced-features/custom-server
[hooks]: https://www.npmjs.com/package/shutdown-hook

Unfortunately, next.js installs its own shutdown hooks _before_ we can install ours, in 
`node_modules/next/dist/bin/next`, and those hooks invoke `process.exit(0)`. While this may be
okay in dev mode, it prevents us from properly cleaning up the running connections in production.
Therefore, we have bypassed these default handlers in an own startup script `nextHooklessStart.js`.

#### Config

For the runtime config, there we also use the default next.js runtime config mechanism.

Even the production build will still execute the `next.config.js` file, so we only need to inject
the applicable runtime configuration into this file.

We use YAML as the general configuration language for the k8s services, so here we parse a YAML
config file and expose its content through the next.js config.

### Validaton

To avoid errors in the config file, we also validate the content against the expected type
structure.

We also do validate all other _incoming external data_, but we do _not_ validate the
browser-to-back-end communication, since this is fully under the control of the next.js app.
Validating it would create extra runtime overhead and probably should only be done for debugging
purposes if at all.

#### JSON validation

We only have one single external JSON/YAML input, which is the config file. We need to specify its
strucure at least in Typescript, to be able to use it in a type-safe way at runtime. To verify the
structure of the data against a defined schema we use [`ajv`][ajv].

`ajv` (as most other validators) requires the data structure definition in JSON schema or JSON data
types (JDT), since these are language-agnostic format specifications. Therefore, we also need a
JSON schema representation of the Typescript config objects. There are [compilers][schema-compiler]
which automatically transform a given JSON schema into Typescript interfaces, but the typed API of
`ajv` is quite picky on how it wants the JSON schema and the Typescript types to correspond to one
another.

Thus, possible solutions are:
1. maintain the JSON schema _and_ the typescript types manually
2. generate either side with a matching compiler (hard to tune to ajv's demands)
3. use the non-Typescript version of ajv, which does not have the strict data type symmetry
   requirements

We chose option 1 here, since
- we only need to maintain a single datatype,
- `ajv` produces Typescript errors in case of mismatches between JSON schema and Typescript types
  (which makes it easier to keep them in sync)
- it allows us to fine-tune both representations, since in general the transformation between
  Typescript interfaces/types and JSON schema is not lossless / not exact.

[ajv]: https://ajv.js.org/json-type-definition.html
[schema-compiler]: https://www.npmjs.com/package/json-schema-to-typescript

#### Protobuf validation

Protobuf data which comes in via NATS is automatically validated to a minimum extent when parsing
the data, since prorobuf is always based on a concrete message grammar.

### Browser to back-end communication

We use standard REST APIs. For getting the stream of message updates to the browser, we use
server-sent events (SSE), since these provide automatic reconnects and do not require any extra
dependencies (both other than WebSockets).

There is a limit of 6 concurrent SSE sessions to the same host in HTTP 1.X, so once we hit that
limit, we have to set up an HTTP2 ingress in the Kubernetes deployment to bypass this. But for
now, we only need a single SSE connection per client / browser.

### Containerization

We follow the [next.js Dockerfile example][next-docker] for a manual container build. In an actual
development setup, the containers should be built by the CI with a unique version based on the
output of `git describe`. 

In this toy example, the container build is manual via `npm run build:container`.

To run the container, you need to have a nats server running locally on the default port (4222)
and (if on Windows) configure your shell to use bash or Powershell. Example for this:

```
npm config set script-shell "C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe"
```

Once this was done and the container was built, use `npm run start:container` to start it.
