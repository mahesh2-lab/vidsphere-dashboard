import {
  getYoutubeAccountByUserId,
  upsertYoutubeAccount,
} from "../database/db.js";
import { createHttpError } from "../middleware/validation.js";
import {
  buildAuthorizationUrl,
  createOAuthState,
} from "../services/oauth.service.js";
import {
  exchangeAuthCode,
  createAuthorizedClient,
} from "../services/token.service.js";
import { getConnectedChannel } from "../services/youtube.service.js";

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

export async function connect(req, res, next) {
  try {
    if (!req.session?.userId) {
      throw createHttpError(401, "Not authenticated.");
    }

    const state = createOAuthState();
    req.session.oauthState = state;
    await saveSession(req);

    return res.redirect(buildAuthorizationUrl(state));
  } catch (error) {
    return next(error);
  }
}

export async function callback(req, res, next) {
  try {
    if (!req.session?.userId) {
      throw createHttpError(401, "Not authenticated.");
    }

    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.redirect(
        `/dashboard?toast=${encodeURIComponent("Google connection was cancelled.")}`,
      );
    }

    if (!code || !state || state !== req.session.oauthState) {
      throw createHttpError(400, "Invalid OAuth state.");
    }

    const existingAccount = await getYoutubeAccountByUserId(req.session.userId);
    const { client, tokens } = await exchangeAuthCode(String(code));
    const refreshToken = tokens.refresh_token || existingAccount?.refresh_token;

    if (!refreshToken) {
      throw createHttpError(
        400,
        "Google did not return a refresh token. Revoke access and try connecting again.",
      );
    }

    const connectedClient = await createAuthorizedClient(
      refreshToken,
      tokens.access_token,
      tokens.expiry_date,
    );

    const channel = await getConnectedChannel(
      refreshToken,
      tokens.access_token,
      tokens.expiry_date,
    );

    await upsertYoutubeAccount({
      userId: req.session.userId,
      channelId: channel.channelId,
      channelName: channel.channelName,
      refreshToken,
    });

    req.session.googleAccessToken = tokens.access_token || null;
    req.session.googleExpiryDate = tokens.expiry_date || null;
    req.session.oauthState = null;
    req.session.oauthClient = Boolean(client && connectedClient);
    await saveSession(req);

    return res.redirect(
      `/dashboard?connected=1&toast=${encodeURIComponent("YouTube connected successfully.")}`,
    );
  } catch (error) {
    return next(error);
  }
}
