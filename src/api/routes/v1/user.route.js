import express from 'express';
import {validate} from '../../validations';
import controller from '../../controllers/user.controller';
import {ADMIN, LOGGED_USER, authorize, authenticate} from '../../middlewares/auth';
import {
  list,
  updateData,
  replaceData,
  updateProfile,
} from '../../validations/user.validation';
const router = express.Router();
router.use(authenticate);
router.param('userId', controller.load);
router
    .route('/')
    /**
     * @api {get} v1/users List Users
     * @apiDescription Get a list of users
     * @apiVersion 1.0.0
     * @apiName ListUsers
     * @apiGroup User
     * @apiPermission admin
     *
     * @apiHeader {String} Authorization   User's access token
     *
     * @apiParam  {Number{1-}}         [page=1]     List page
     * @apiParam  {Number{1-100}}      [perPage=1]  Users per page
     * @apiParam  {Number{1-100}}      [perPage=1]  Users per page
     * @apiParam  {String}             [username]   User's username
     * @apiParam  {String}             [email]      User's email
     * @apiParam  {String=user,admin}  [role]       User's role
     *
     * @apiSuccess {Object[]} users List of users.
     *
     * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
     * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
     */
    .get(authorize(), validate(list), controller.list);
router
    .route('/:userId')
    /**
     * @api {get} v1/users/:id Get User
     * @apiDescription Get user information
     * @apiVersion 1.0.0
     * @apiName GetUser
     * @apiGroup User
     * @apiPermission user
     *
     * @apiHeader {String} Authorization   User's access token
     *
     * @apiSuccess {String}  id         User's id
     * @apiSuccess {String}  name       User's name
     * @apiSuccess {String}  email      User's email
     * @apiSuccess {String}  role       User's role
     * @apiSuccess {Date}    createdAt  Timestamp
     *
     * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data
     * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can access the data
     * @apiError (Not Found 404)    NotFound     User does not exist
     */
    .get(authorize(ADMIN), controller.get)
    /**
     * @api {patch} v1/users/:id Update User
     * @apiDescription Update some fields of a user document
     * @apiVersion 1.0.0
     * @apiName UpdateUser
     * @apiGroup User
     * @apiPermission user
     *
     * @apiHeader {String} Authorization   User's access token
     *
     * @apiParam  {String}             email     User's email
     * @apiParam  {String{6..128}}     password  User's password
     * @apiParam  {String{..128}}      [name]    User's name
     * @apiParam  {String=user,admin}  [role]    User's role
     * (You must be an admin to change the user's role)
     *
     * @apiSuccess {String}  id         User's id
     * @apiSuccess {String}  name       User's name
     * @apiSuccess {String}  email      User's email
     * @apiSuccess {String}  role       User's role
     * @apiSuccess {Date}    createdAt  Timestamp
     *
     * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
     * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
     * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can modify the data
     * @apiError (Not Found 404)    NotFound     User does not exist
     */
    .patch(authorize(ADMIN), validate(updateData), controller.update)
    /**
     * @api {put} v1/users/:id Replace User
     * @apiDescription Replace the whole user document with a new one
     * @apiVersion 1.0.0
     * @apiName ReplaceUser
     * @apiGroup User
     * @apiPermission user
     *
     * @apiHeader {String} Authorization   User's access token
     *
     * @apiParam  {String}             email     User's email
     * @apiParam  {String{6..128}}     password  User's password
     * @apiParam  {String{..128}}      [name]    User's name
     * @apiParam  {String=user,admin}  [role]    User's role
     * (You must be an admin to change the user's role)
     *
     * @apiSuccess {String}  id         User's id
     * @apiSuccess {String}  name       User's name
     * @apiSuccess {String}  email      User's email
     * @apiSuccess {String}  role       User's role
     * @apiSuccess {Date}    createdAt  Timestamp
     *
     * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
     * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
     * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can modify the data
     * @apiError (Not Found 404)    NotFound     User does not exist
     */
    .put(authorize(ADMIN), validate(replaceData), controller.replace);
router
    .route('/:userId/profile')
    .get(authorize(LOGGED_USER), controller.profile)
    .patch(authorize(LOGGED_USER), validate(updateProfile), controller.update);
export default router;
