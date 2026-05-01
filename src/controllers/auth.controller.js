/**
 * Auth controller — register, login, refresh.
 *
 * Sample requests/responses:
 *
 * POST /auth/register
 *   Body: { "name": "John Doe", "email": "john@example.com", "password": "Str0ng!Pass" }
 *   201: { "success": true, "data": { "user": { id, name, email, created_at }, "access_token": "…", "refresh_token": "…" } }
 *
 * POST /auth/login
 *   Body: { "email": "john@example.com", "password": "Str0ng!Pass" }
 *   200: { "success": true, "data": { "user": { … }, "access_token": "…", "refresh_token": "…" } }
 *
 * POST /auth/refresh
 *   Body: { "refresh_token": "…" }
 *   200: { "success": true, "data": { "access_token": "…", "refresh_token": "…" } }
 */
const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      data: {
        user:          result.user,
        access_token:  result.accessToken,
        refresh_token: result.refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({
      success: true,
      data: {
        user:          result.user,
        access_token:  result.accessToken,
        refresh_token: result.refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    const result = await authService.refresh(refresh_token);
    res.status(200).json({
      success: true,
      data: {
        access_token:  result.accessToken,
        refresh_token: result.refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh };
