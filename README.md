# Next.js + NATS + Protobuf + Typescript demo ap

This is a toy example of a chat application which shows how to integrate a Next.js app with
a backend when the communication with the back-end is done via protobuf messages over NATS.

To add:

- NATS JetStream integration
- Protobuf integration
- YAML config file
- K8s deployment
- HTTP/2 ingress for K8s

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
`node_modules/next/dist/bin/next`:

```
process.on('SIGTERM', ()=>process.exit(0)
);
process.on('SIGINT', ()=>process.exit(0)
);
``` 

These lines have to be commented out or our `_shutdown.ts` file has to be imported first, in 
order for the clean shutdown to work.

#### Config

For the runtime config, there we also use the default next.js runtime config mechanism.
