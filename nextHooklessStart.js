/* Avoid using the main `next` entry command, since this sets up SIGINT handlers which terminate
 * the process immediately. We want to clean up before exiting and have our own SIGINT handler.
 * Therefore, use the `next-start.js` script directly.
 */

const { nextStart } = require("next/dist/cli/next-start");

nextStart();
