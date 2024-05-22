import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import {DateTime} from 'luxon';

export const now = DateTime.utc();
export const isNotEmpty = (a) => {
  return !isNull(a) && !isEmpty(isValidNumber(a) ? a.toString() :a ) && !isUndefined(a);
};
export const isValidString = (a) => {
  return isString(a) && a.trim().length > 0;
};
export const isValidNumber = (a) => {
  return isNumber(a) && Number(a) >= 0;
};
export const isValidObject = (a) => {
  return isObject(a) && Object.keys(a).length > 0;
};
export const isValidArray= (a) => {
  return isArray(a) && a.length > 0;
};

export const tryParse = (json) => {
  try {
    if (isValidString(json)) {
      if (isNumber(json)) {
        json = Number(json);
      } else {
        json = JSON.parse(json);
      }
    }
    if (isValidArray(json)) {
      json = json.map((v) => tryParse(v));
    }
    if (isValidObject(json)) {
      Object.keys(json).forEach((key) => {
        if (key) {
          json[key] = tryParse(json[key]);
        }
      });
    }
  } catch (_) {}
  return json;
};
export const renameKey = (o, oldKey, newKey) => {
  if (isValidObject(o)) {
    if (oldKey !== newKey && o.hasOwnProperty(oldKey)) {
      Object.defineProperty(o, newKey, Object.getOwnPropertyDescriptor(o, oldKey));
      delete o[oldKey];
    }
    return o;
  }
};
export const keysToCamelCase = (obj) => {
  if (isValidArray(obj)) {
    return obj.map((v) => keysToCamelCase(v));
  } else if (isValidObject(obj)) {
    return Object.keys(obj).reduce((result, key) => ({...result, [camelCase(key)]: keysToCamelCase(tryParse(obj[key]))}), {});
  }
  return obj;
};
export const keysToSnakeCase = (obj) => {
  if (isValidArray(obj)) {
    return obj.map((v) => keysToSnakeCase(v));
  } else if (isValidObject(obj)) {
    return Object.keys(obj).reduce((result, key) => ({...result, [snakeCase(key)]: keysToSnakeCase(tryParse(obj[key]))}), {});
  }
  return obj;
};
