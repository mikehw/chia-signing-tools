export function get_str_to_sign(messageObject: { msg: string }) {
  return messageObject.msg;
}

export function get_str_to_sign_v0_1_x(messageObject: {
  did: string;
  message: string;
}) {
  return JSON.stringify([messageObject.did, messageObject.message]);
}
