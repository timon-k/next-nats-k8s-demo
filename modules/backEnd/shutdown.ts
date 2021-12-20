import shutdownHook from "shutdown-hook";

export const hook = new shutdownHook();

hook.register();
