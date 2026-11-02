import { db } from "../app/db/client.js";
import { oidcLoginAttempts, sessions } from "../app/db/schema.js";

// Run after restoring a backup and before starting the server.
db.transaction((tx) => {
  tx.delete(sessions).run();
  tx.delete(oidcLoginAttempts).run();
});

console.log("Invalidated restored sessions and pending login attempts.");
