import { customAlphabet } from 'nanoid';

export const generateRandomToken = (length: number = 64) => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, length);
  const token = nanoid();
  return token;
};
