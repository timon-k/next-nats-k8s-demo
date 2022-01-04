# next-nats-k8s-demo chat  app

This is a toy chat application which serves as a technical showcase to demonstrate

- how to integrate a Next.js back-end with streaming data coming from a back-end where
    - the backend is connected via NATS and uses both ephemeral (NATS) as well as persistent
      (JetStream) messaging
    - protobuf messages are used to communicate with the back-end.
- how to reliably connect the browser / client-side of Next.js to the streaming data in the
  back end using server-sent events (SSE).
- how to read a runtime service configuration in YAML format in a Next.js back-end.
- how to deploy the whole application to Kubernetes.

The app sends all messages between the users as ephemeral messages, i.e., a user who logs into
an existing chatroom does not see previous messages. Metadata like user logins/logouts are sent
as persistent messages, so that users can see who is logged in.

In this chat context we could have just as well made all of the messages persistent. The split 
was made here, in order to be able to showcase how to mix both types of communication under one
single client-facing SSE stream.

To add:

- Protobuf integration

## First steps

- `npm install`
- Run a NATS 2.X server with JetStream enabled, e.g., `docker run --rm -p 4222:4222 nats:2.6.6 -js`
- `npm run dev`
- Visit `http://localhost:3000/chat` and enter chat messages (from one or multiple browsers)
- Log on and off and see that metadata is persisted in NATS JetStream, whereas messages
  are not.
- Restart the server and log in again to be sure that metadata persistence works.
- Assuming you have access to a Kubernetes cluster:
    - Install the [nginx ingress](https://kubernetes.github.io/ingress-nginx/deploy/) in your cluster
    - Check that the ingress pods are running via `kubectl get pods --namespace=ingress-nginx`
    - Deploy the app + NATS + ingress via `kubectl apply -f k8s-deployment.yaml`
    - Open `http://localhost/chat` in a browser.
        - If this does not work you have to open a `port-forward` into your cluster as detailed
          in the [nginx ingress docs][nginx-ingress].

[nginx-ingress]: https://kubernetes.github.io/ingress-nginx/deploy/#docker-desktop

## Limits

This is just a simple prototype, aspects which are definitively not production-ready include

- User authentication is not done at all for now, the REST calls to the back-end just supply
  the username as a URL parameter (GET) or content (POST). A real-world setup would use one
  of the [next.js authentication ptterns][next-auth].
- JetStream subscriptions are left dangling (dangling consumers) in case of next.js server
  terminations (the SSE stream should be closed properly in this case, currently it is not).
- Under HTTP1.X each client can only have a maximum of 5 SSE sessions with the same host.
  Not a problem for our chat app (since it only has one SSE connection anyways), but in real
  deployments you would want to circumvent this problem by using a HTTP/2 ingress for K8s.
- The whole Kubernetes deployment is just quick & dirty sketch. Actual deployments would at
  least configure replication and persistence for NATS.

[next-auth]: https://nextjs.org/docs/authentication

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

One thing which we would really like to have run-time-configuable is the base path, so that we
could later decide to serve the application from `/chat` even though it was built to be served
from `/`. Unfortunately, next.js does _not_ allow this, since the [`basePath` option][basepath]
needs to be set at _build_ time. That means, our next build and our k8s ingress config _must_ be
kept in sync.

[basepath]: https://nextjs.org/docs/api-reference/next.config.js/basepath

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
