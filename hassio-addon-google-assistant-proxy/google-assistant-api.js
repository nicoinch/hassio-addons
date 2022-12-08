const fs = require('fs');
const GoogleAssistant = require('/usr/src/app/node_modules/google-assistant');

const config = {
  auth: {
    keyFilePath: '/usr/src/app/client_secret.json',
    savedTokensPath: '/usr/src/app/tokens.json',
  },
  conversation: {
    lang: 'en-US',
    isNew: true,
  },
};

const checkFileExistsSync = filepath => {
  let exists = true;

  try {
    fs.accessSync(filepath, fs.constants.F_OK);
  } catch (e) {
    exists = false;
  }

  return exists;
};

const readJsonFile = filepath => {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    console.log(e);
    exitAndLogError(`Failed reading JSON file at path ${filepath}`);
  }
};

const exitAndLogError = errorMsg => {
  console.log(`[ERROR] ${errorMsg}`);
  process.exit(1);
};

const validateFiles = () => {
  if (!checkFileExistsSync(config.auth.keyFilePath)) {
    exitAndLogError(
      `Client Secret file at path '${config.auth.keyFilePath}' does not exist.`,
    );
  }

  if (!checkFileExistsSync(config.auth.savedTokensPath)) {
    exitAndLogError(
      `Tokens file at path '${config.auth.savedTokensPath}' does not exist.`,
    );
  }

  const secretFileContent = readJsonFile(config.auth.keyFilePath).installed;

  if (secretFileContent.token_uri !== 'https://oauth2.googleapis.com/token') {
    exitAndLogError(
      `The Client Secret file at path '${config.auth.keyFilePath}' has invalid 'token_uri' value. Expecting value 'https://oauth2.googleapis.com/token', but was '${secretFileContent.token_uri}'. Please make sure you download OAuth client file from GCP Console / API & Services / Credentials.`,
    );
  }

  if (!secretFileContent.redirect_uris) {
    exitAndLogError(
      `The Client Secret file at path '${config.auth.keyFilePath}' is missing 'redirect_uris' property. Please make sure you download OAuth client file from GCP Console / API & Services / Credentials.`,
    );
  }
};

const cast = async (message, language) => {
  const assistant = new GoogleAssistant(config.auth);

  console.log('Cast config', config);

  config.conversation.textQuery = `${message}`;
  config.conversation.lang = language || config.conversation.lang;

  console.log(
    `Sending message (${config.conversation.lang}):`,
    config.conversation.textQuery,
  );

  return new Promise((resolve, reject) => {
    assistant
      .on('ready', () => assistant.start(config.conversation))
      .on('started', conversation => {
        conversation
          .on('response', text => {
            const response = text || 'empty';
            console.log('[OK] Conversation Response: ', response);
            resolve(response);
          })
          .on('ended', (error, continueConversation) => {
            if (error) {
              console.log('[ERROR] Conversation Ended Error:', error);
            } else if (continueConversation) {
              console.log('[WARN] Conversation continue is not handled');
            } else {
              console.log('[OK] Conversation Completed');
              conversation.end();
            }
          })
          .on('error', error => {
            console.log('[ERROR] Error while broadcasting:', error);
            reject(new Error(`Error while broadcasting: ${error}`));
          });
      })
      .on('error', error => {
        console.log('[ERROR] Error while broadcasting: ', error);
        reject(new Error(`Error while broadcasting: ${error}`));
      });
  });
};

module.exports = { validateFiles, cast };
