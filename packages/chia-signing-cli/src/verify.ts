import { verify } from 'chia-signing-tools';
import * as prompts from 'prompts';

async function main() {
  const messageString = await getMessage();
  const verified = await verify(messageString);
  if (verified.isValid) {
    console.log('Message verified');
    console.log(verified.message);
  } else {
    console.log('Signature not valid');
  }
}

async function getMessage() {
  const response = await prompts.default({
    type: 'text',
    name: 'message',
    message: 'Message to verify',
  });
  return response.message;
}

main();
