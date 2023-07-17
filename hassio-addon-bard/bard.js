import Bard, { askAI } from "bard-ai";
import express from "express";

const port = 8000;

const app = express();

app.post("/bard", express.json(), async (req, res) => {
  console.log("POST /bard", req.body);
  try {
    const answer = await askAI(req.body);
    res.json({ answer });
  } catch (error) {
    console.error("Error while asking AI", error);
    res.status(500).json({ error });
    return;
  }
});

export const bard = async (options) => {
  if (!options.cookieKey) {
    console.error("No options.cookieKey provided");
    return;
  }
  const COOKIE_KEY = options.cookieKey;

  await Bard.init(COOKIE_KEY);

  app.listen(port, () => {
    console.log(`Ring Bridge is running on port ${port}.`);
  });
};
