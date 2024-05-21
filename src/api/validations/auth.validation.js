import Joi from 'joi';
import {email, password, token, username} from './index';
// POST /v1/auth/register
export const register = {
    body: Joi.object().keys({
        username: username.required(),
        email: email.required(),
        password: password.required(),
    }).required(),
};
// POST /v1/auth/signIn
export const login = {
    body: Joi.object().keys({
        email: email,
        username: username.when('email', {is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required()}),
        password: password.required(),
    }).required(),
};
// POST /v1/auth/facebook
// POST /v1/auth/google
export const oAuth = {
    body: Joi.object().keys({
        username: username.required(),
        accessToken: token.required(),
    }).required(),
};
// POST /v1/auth/refresh-token
export const refresh = {
    body: Joi.object().keys({
        email: email,
        username: username.when('email', {is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required()}),
        refreshToken: token.required(),
    }).required(),
};
// POST /v1/auth/refresh
export const sendPasswordReset = {
    body: Joi.object().keys({
        email: email.required(),
    }).required(),
};
// POST /v1/auth/password-reset
export const passwordReset = {
    body: Joi.object().keys({
        email: email.required(),
        resetToken: token.required(),
        password: password.required(),
        confirmPassword: Joi.any().valid(Joi.ref('password')).required().options({messages: {'any.only': '{{#label}} does not match'}}),
    }).required(),
};
