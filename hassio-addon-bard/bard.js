import Bard from "bard-ai";
import express from "express";

const port = 8000;
let myBard;

const app = express();
app.use(express.json());

app.post("/bard", async (req, res) => {
  console.log("POST /bard", req.body);
  try {
    if (req.body?.prompt) {
      console.log("Asking AI ", req.body.prompt);
      const answer = await myBard.ask(req.body.prompt);
      res.json({ answer });
    } else {
      res.status(400).json({ error: "No prompt provided" });
    }
  } catch (error) {
    console.error("Error while asking AI", error);
    res.status(500).json({ error });
  }
});

export const bard = async (options) => {
  if (!options.cookieKey) {
    console.error("No options.cookieKey provided");
    return;
  }
  const COOKIE_KEY = options.cookieKey;

  myBard = new Bard(COOKIE_KEY);

  app.listen(port, () => {
    console.log(`Bard is running on port ${port}.`);
  });
};
