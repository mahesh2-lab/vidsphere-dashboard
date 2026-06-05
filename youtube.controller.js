import fs from "fs/promises";
import { getYoutubeAccountByUserId } from "../database/db.js";
import {
  createHttpError,
  validateVideoQuery,
  validateVideoUploadPayload,
} from "../middleware/validation.js";
import {
  getChannelStats,
  listChannelVideos,
  uploadVideoToYoutube,
  listChannelComments,
} from "../services/youtube.service.js";

async function getConnectedAccount(req) {
  if (!req.session?.userId) {
    throw createHttpError(401, "Not authenticated.");
  }

  const account = await getYoutubeAccountByUserId(req.session.userId);

  if (!account) {
    throw createHttpError(404, "Connect YouTube before using this feature.");
  }

  return account;
}

export async function channel(req, res, next) {
  try {
    const account = await getConnectedAccount(req);
    const stats = await getChannelStats(
      account.refresh_token,
      req.session.googleAccessToken,
      req.session.googleExpiryDate,
    );

    return res.json({
      channel: {
        channelId: account.channel_id,
        channelName: account.channel_name,
        channelAvatar: stats.channelAvatar,
        connectedAt: account.created_at,
        ...stats,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function videos(req, res, next) {
  try {
    const account = await getConnectedAccount(req);
    const query = validateVideoQuery(req.query);
    const result = await listChannelVideos(account.refresh_token, {
      accessToken: req.session.googleAccessToken,
      expiryDate: req.session.googleExpiryDate,
      ...query,
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

export async function stats(req, res, next) {
  try {
    const account = await getConnectedAccount(req);
    const channelStats = await getChannelStats(
      account.refresh_token,
      req.session.googleAccessToken,
      req.session.googleExpiryDate,
    );

    return res.json({
      stats: {
        channelName: account.channel_name,
        channelId: account.channel_id,
        channelAvatar: channelStats.channelAvatar,
        ...channelStats.stats,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function upload(req, res, next) {
  try {
    const account = await getConnectedAccount(req);

    if (!req.file) {
      throw createHttpError(400, "Please choose a video file to upload.");
    }

    const payload = validateVideoUploadPayload(req.body);
    const uploaded = await uploadVideoToYoutube(account.refresh_token, {
      accessToken: req.session.googleAccessToken,
      expiryDate: req.session.googleExpiryDate,
      filePath: req.file.path,
      ...payload,
    });

    await fs.unlink(req.file.path).catch(() => {});

    return res.status(201).json({
      message: "Video uploaded successfully.",
      video: uploaded,
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    return next(error);
  }
}

export async function comments(req, res, next) {
  try {
    const account = await getConnectedAccount(req);
    const result = await listChannelComments(account.refresh_token, {
      accessToken: req.session.googleAccessToken,
      expiryDate: req.session.googleExpiryDate,
    });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}
