import Joi from 'joi';
import {boolean, email, fullName, imageUri, language, list as baseList, phone, username} from './index';
export const list= {
  query: baseList.keys({
    username: username,
    email: email,
    firstName: fullName,
    lastName: fullName,
  }),
};
export const updateData = {
  body: Joi.object().keys({
    firstName: fullName.uppercase(),
    lastName: fullName.uppercase(),
    email: email,
    phone: phone,
    image: imageUri,
    language: language,
    status: boolean,
  }).or('firstName', 'lastName', 'email', 'phone', 'image', 'language', 'status'),
};
export const replaceData = {
  body: Joi.object().keys({
    firstName: fullName.uppercase(),
    lastName: fullName.uppercase(),
    email: email,
    phone: phone,
    image: imageUri,
    language: language,
    status: boolean,
  }).or('firstName', 'lastName', 'email', 'phone', 'image', 'language', 'status'),
};
// PATCH /v1/users/:userId/profile
export const updateProfile = {
  body: Joi.object().keys({
    firstName: fullName.uppercase(),
    lastName: fullName.uppercase(),
    email: email,
    phone: phone,
    image: imageUri,
    language: language,
  }).or('firstName', 'lastName', 'email', 'phone', 'image', 'language'),
};
