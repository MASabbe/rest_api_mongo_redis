import {appName, appVersion, jwtSecret} from '../config/vars';
import EncodeDecode from '../helper/EncodeDecode.helper';

const encDec = new EncodeDecode(jwtSecret);
const param = {
  app: appName,
  version: appVersion,
};
const signatureTest = () => {
  const encrypt = encDec.enc(JSON.stringify(param));
  const decrypt = encDec.dec(encrypt);
  return {
    encrypt,
    decrypt,
  };
};
describe('Signature API', () => {
  describe('encode signature', () => {
    it('should return an object', () => {
      const {encrypt, decrypt} = signatureTest();
      console.log(encrypt, decrypt);
      expect(typeof encrypt).toBe('string');
      expect(typeof decrypt).toBe('object');
      expect(decrypt).toEqual(param);
    });
  });
});
export default signatureTest;
