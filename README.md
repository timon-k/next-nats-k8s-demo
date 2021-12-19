# Next.js + NATS + Protobuf + Typescript demo ap

This is a toy example of a chat application which shows how to integrate a Next.js app with
a backend when the communication with the back-end is done via protobuf messages over NATS.

To add:

- NATS Shutdown Hook
- NATS JetStream integration
- Protobuf integration
- YAML config file
- K8s deployment
- HTTP/2 ingress for K8s

## Design decisions

### Follow next.js logic as far as possible

next.sj advises against using a custom server. This means that we do not have any dedicated
setup or teardown phase for things like the NATS connection. Instead, we use lazy initialization
for setup and standard node shutdown hook for teardown. This enables us to benefit from the
optimizations in the default next.js server and keep the option open to later move the code
to serverless environments.

Same for the config, there we also use the default next.js runtimon config mechanism.
