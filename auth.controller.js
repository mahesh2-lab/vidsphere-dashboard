import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  createUser,
  findUserByEmail,
  findUserById,
  getYoutubeAccountByUserId,
} from "../database/db.js";
import {
  createHttpError,
  validateLoginPayload,
  validateSignupPayload,
} from "../middleware/validation.js";

function toSafeUser(user, youtubeAccount = null) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.created_at,
    youtubeConnected: Boolean(youtubeAccount),
    channel: youtubeAccount
      ? {
          channelId: youtubeAccount.channel_id,
          channelName: youtubeAccount.channel_name,
          connectedAt: youtubeAccount.created_at,
        }
      : null,
  };
}

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function establishAuthenticatedSession(req, userId) {
  await regenerateSession(req);
  req.session.userId = userId;
  req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  await saveSession(req);
}

export async function getCsrfToken(req, res, next) {
  try {
    if (!req.session.csrfToken) {
      req.session.csrfToken = crypto.randomBytes(32).toString("hex");
      await saveSession(req);
    }

    return res.json({ csrfToken: req.session.csrfToken });
  } catch (error) {
    return next(error);
  }
}

export async function signup(req, res, next) {
  try {
    const { email, password } = validateSignupPayload(req.body);
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      throw createHttpError(409, "An account with that email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = await createUser({ email, passwordHash });
    await establishAuthenticatedSession(req, userId);

    const user = await findUserById(userId);
    return res.status(201).json({
      message: "Account created successfully.",
      user: toSafeUser(user),
      csrfToken: req.session.csrfToken,
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = validateLoginPayload(req.body);
    const user = await findUserByEmail(email);

    if (!user) {
      throw createHttpError(401, "Invalid email or password.");
    }

    const matches = await bcrypt.compare(password, user.password_hash);

    if (!matches) {
      throw createHttpError(401, "Invalid email or password.");
    }

    await establishAuthenticatedSession(req, user.id);
    return res.json({
      message: "Logged in successfully.",
      user: toSafeUser(user),
      csrfToken: req.session.csrfToken,
    });
  } catch (error) {
    return next(error);
  }
}

export async function logout(req, res, next) {
  try {
    if (!req.session) {
      return res.json({ message: "Logged out successfully." });
    }

    return req.session.destroy((error) => {
      if (error) {
        return next(error);
      }

      res.clearCookie(process.env.SESSION_NAME || "youtube.sid");
      return res.json({ message: "Logged out successfully." });
    });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    if (!req.session?.userId) {
      return res.json({
        user: null,
        csrfToken: req.session?.csrfToken || null,
      });
    }

    const user = await findUserById(req.session.userId);

    if (!user) {
      return res.json({
        user: null,
        csrfToken: req.session?.csrfToken || null,
      });
    }

    const youtubeAccount = await getYoutubeAccountByUserId(user.id);

    return res.json({
      user: toSafeUser(user, youtubeAccount),
      csrfToken: req.session.csrfToken || null,
    });
  } catch (error) {
    return next(error);
  }
}

export async function ensureSessionUser(req) {
  if (!req.session?.userId) {
    throw createHttpError(401, "Not authenticated.");
  }

  const user = await findUserById(req.session.userId);

  if (!user) {
    throw createHttpError(401, "Not authenticated.");
  }

  return user;
}
