import { bard } from "/usr/src/app/bard.js";
import options from "./options.json" assert { type: "json" };

(async () => {
  await bard(options);
})();
