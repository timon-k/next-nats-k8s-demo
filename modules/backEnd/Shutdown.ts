import shutdownHook from "shutdown-hook";

export const commonShutdownHook = new shutdownHook();

commonShutdownHook.register();
