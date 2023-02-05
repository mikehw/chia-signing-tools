export function get_str_to_sign(messageObject: {
  did: string;
  message: string;
}) {
  return JSON.stringify([messageObject.did, messageObject.message]);
}
