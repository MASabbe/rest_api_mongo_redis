import Joi from 'joi';
import joiPhoneNumber from 'joi-phone-number';
import {validate as validation} from 'express-validation';

const myCustomPhone = Joi.extend(joiPhoneNumber);
const checkPhoneNumber = (value, helpers) => {
  const {phoneCode, phoneNumber} = value;
  const code = phoneNumber.substring(0, `+${phoneCode}`.length);
  if (`+${phoneCode}` !== code) {
    return helpers.message(`Invalid phone number. Phone number did not match with phone code.`);
  }
  return value;
};
const integer = Joi.number().integer();
export const string = Joi.string().trim();
export const validate = (schema) => {
  return validation(schema, {context: true}, {abortEarly: false, errors: {stack: true, wrap: {label: '%'}}});
};
export const id = integer.min(1);
export const idMember = string.alphanum().min(10).max(10);
export const username = string.pattern(/^([a-zA-Z0-9](?=.*[a-zA-Z]){1,20})(?:-([0-9]{1,4}))?/, 'username').min(3).max(25);
export const email = string.email({
  minDomainSegments: 2, tlds: {allow: ['com', 'net', 'id']},
}).max(150);
export const fullName = string.pattern(/^[a-zA-Z ]+$/, 'name').max(55);
export const number = string.pattern(/^[0-9]+$/, 'numbers').max(150);
export const imageUri = string.pattern(/^[a-zA-Z0-9%.$_/]+$/, 'storage').max(255);
export const password = string.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[-+_!@#$%^&*.,?])/, 'password').min(6).max(15);
export const platform = string.valid('web', 'WEB', 'android', 'ANDROID', 'ios', 'IOS').lowercase();
export const textAlpha = string.pattern(/^[a-zA-Z]+$/, 'alpha');
export const https = string.uri();
export const phoneNumber = myCustomPhone.string().pattern(/^\+/).phoneNumber({
  defaultCountry: 'ID',
  format: 'e164',
});
export const amount = integer.min(1).max(9999);
export const page = integer.min(1);
export const perPage = integer.min(1).max(100);
export const search = string.pattern(/^[a-zA-Z0-9%.$_@ ]+$/, 'search').min(3).max(255);
export const date = Joi.date().iso();
export const type = integer.valid(1, 2, 3);
export const status = integer.valid(0, 1, 2);
export const rupiah = integer.integer().min(0).max(9999999999);
export const bankType = string.valid('origin', 'other', 'virtual');
export const withdrawalType = string.valid('bonus', 'reward', 'promo');
export const boolean = Joi.bool();
export const uuid = string.uuid();
export const language = string.valid('en', 'id', 'jp');
export const phone = Joi.object().keys({
  countryName: fullName.required(),
  countryCode: textAlpha.max(5).required(),
  phoneCode: number.max(5).required(),
  phoneNumber: phoneNumber.required(),
}).custom(checkPhoneNumber);
export const verification = Joi.object().keys({
  cardNumber: fullName.required(),
  cardImage: imageUri.required(),
  faceImage: imageUri.required(),
});
export const list = Joi.object().keys({
  page: page.required(),
  perPage: perPage.required(),
  search: search,
  dir: string.valid('asc', 'desc'),
});
