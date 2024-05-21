import Utf8 from 'crypto-js/enc-utf8';
import AES from 'crypto-js/aes';
import Rabbit from 'crypto-js/rabbit';
import Rc4 from 'crypto-js/rc4';
import HmacSHA512 from 'crypto-js/hmac-sha512';
import {tryParse} from './Util.helper';

export default class EncodeDecode {
  /**
   * Constructs a new instance of the class with the specified secret.
   *
   * @param {type} secret - the secret to be used
   */
  constructor(secret) {
    this.key = secret;
    this.aesEnc = this.aesEnc.bind(this);
    this.aesDec = this.aesDec.bind(this);
    this.rabbitEnc = this.rabbitEnc.bind(this);
    this.rabbitDec = this.rabbitDec.bind(this);
    this.rc4Enc = this.rc4Enc.bind(this);
    this.rc4Dec = this.rc4Dec.bind(this);
    this.dec = this.dec.bind(this);
    this.enc = this.enc.bind(this);
  }
  aesEnc(text) {
    return AES.encrypt(text, this.key).toString();
  }
  aesDec(ciphertext) {
    const bytes = AES.decrypt(ciphertext, this.key);
    return bytes.toString(Utf8);
  }
  rabbitEnc(text) {
    return Rabbit.encrypt(text, this.key).toString();
  }
  rabbitDec(ciphertext) {
    const bytes = Rabbit.decrypt(ciphertext, this.key);
    return bytes.toString(Utf8);
  }
  rc4Enc(text) {
    return Rc4.encrypt(text, this.key).toString();
  }
  rc4Dec(ciphertext) {
    const bytes = Rc4.decrypt(ciphertext, this.key);
    return bytes.toString(Utf8);
  }
  hmacSHA512Enc(text) {
    return HmacSHA512(text, this.key).toString();
  }
  /**
   * Encrypts the given text using HMAC-SHA512 and AES encryption.
   *
   * @param {string} text - The text to be encrypted.
   * @throws {Error} If the input is not a string.
   * @return {string} The encrypted data.
   */
  enc(text) {
    if (typeof text !== 'string') throw new Error('encrypt data is not an string');
    const hmac = this.hmacSHA512Enc(text);
    const aes = this.aesEnc(text);
    const data = {
      params: hmac,
      ApiKey: aes,
    };
    return this.aesEnc(JSON.stringify(data));
  }
  /**
   * Decrypts the given text using AES encryption and validates the integrity of the decrypted data.
   *
   * @param {string} text - The encrypted text to be decrypted.
   * @throws {Error} Throws an error if the decrypted data is not a string.
   * @throws {Error} Throws an error if the decrypted data does not match the provided API key.
   * @return {Object} Returns the decrypted API key as a JavaScript object.
   */
  dec(text) {
    if (typeof text !== 'string') throw new Error('decrypt data is not an string');
    const data = this.aesDec(text);
    let {params, ApiKey} = tryParse(data);
    ApiKey = this.aesDec(ApiKey);
    const hmac = this.hmacSHA512Enc(ApiKey);
    if (params !== hmac) {
      throw new Error('Invalid param. Api key did not match');
    }
    return tryParse(ApiKey);
  }
}
