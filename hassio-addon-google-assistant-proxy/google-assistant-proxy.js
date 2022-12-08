const fs = require('fs');
const express = require('express');
const axios = require('/usr/src/app/node_modules/axios');
const { validateFiles, cast } = require('./google-assistant-api');

module.exports = async options => {
  if (!options.jsonKeyFile) {
    console.error('No JSON key file provided');
    process.exit(1);
  }
  if (!options.tokens) {
    console.error('No token provided');
    process.exit(1);
  }

  try {
    fs.writeFileSync('/usr/src/app/client_secret.json', options.jsonKeyFile);
    fs.writeFileSync('/usr/src/app/tokens.json', options.tokens);
  } catch (err) {
    console.error('Could not write JSON key file.', err);
  }

  // Validate required files
  validateFiles();

  const server = express();
  const port = 8085;
  server.use(express.json());

  // Respond only on POST /broadcast route
  server.post('/proxy', async (req, res) => {
    if (!req.body || !req.body.message || req.body.message.len < 2) {
      res.status(400).json({
        error:
          "Expecting valid JSON body with 'message' property with length of minimum 2 characters.",
      });
    } else {
      console.log('Server sending message...');
      try {
        const response = await cast(req.body.message, options.language);
        res.json({ response });
      } catch (error) {
        res.status(500).json({ error });
      }
    }
  });

  // All other routes shall return HTTP 404
  server.use((req, res) => {
    res.status(404).json({ error: 'Only POST /proxy endpoint is supported' });
  });

  const serverInstance = server.listen(port, () => {
    console.log(
      `[OK] Google Assistant Proxy started at: http://localhost:${port}`,
    );
  });

  // Gracefully shutdown ExpressJS
  process.on('SIGTERM', () => {
    console.log('[WARN] SIGTERM signal received: closing HTTP server');
    serverInstance.close(() => {
      console.log('HTTP server closed');
    });
  });
};
