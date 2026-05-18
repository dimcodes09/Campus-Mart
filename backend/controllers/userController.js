const User = require("../models/User");

const rewardMatches = (reward, rewardId) => {
  const selectedId = rewardId?.toString();
  return [reward?.id, reward?.rewardId, reward?._id]
    .filter(Boolean)
    .some((value) => value.toString() === selectedId);
};

const DEFAULT_REWARDS = [
  {
    id: "free-delivery-50",
    title: "Rs.50 OFF",
    description: "Free Delivery",
    pointsCost: 50,
    expiresAt: new Date("2026-06-11T23:59:59.999Z"),
    used: false,
    redeemedAt: null,
  },
];

const getAuthenticatedUser = async (req) => {
  const userId = req.user?._id || req.user?.id || req.userId;
  if (userId) return User.findById(userId);

  return req.user?.save ? req.user : null;
};

const ensureRewardState = (user) => {
  if (typeof user.points !== "number") user.points = 84;
  if (typeof user.dayStreak !== "number") user.dayStreak = 1;

  const rewards = Array.isArray(user.rewards) ? user.rewards : [];
  const hasDefaultReward = rewards.some((reward) => reward.id === DEFAULT_REWARDS[0].id);

  if (!rewards.length || !hasDefaultReward) {
    user.rewards = hasDefaultReward ? rewards : [...rewards, ...DEFAULT_REWARDS];
  }

  return user.rewards;
};

const getRewardCost = (reward) => {
  const cost = Number(reward?.pointsCost ?? reward?.cost ?? 0);
  return Number.isFinite(cost) ? cost : 0;
};

const getRewards = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Please log in again to view rewards.",
      });
    }

    const rewards = ensureRewardState(user);
    await user.save();

    res.json({
      success: true,
      points: user.points,
      dayStreak: user.dayStreak,
      rewards,
    });
  } catch {
    res.status(500).json({ success: false, message: "Rewards fetch failed." });
  }
};

const redeemReward = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    const rewardId = req.body?.rewardId || req.body?.id || DEFAULT_REWARDS[0].id;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Please log in again to redeem rewards.",
      });
    }

    if (!rewardId) {
      return res.status(400).json({ success: false, message: "Reward ID is required." });
    }

    const rewards = ensureRewardState(user);
    const reward = rewards.find((item) => rewardMatches(item, rewardId));

    if (!reward) {
      return res.status(404).json({ success: false, message: "Reward not found." });
    }

    if (reward.used) {
      return res.status(400).json({ success: false, message: "Reward already used." });
    }

    const pointsCost = getRewardCost(reward);
    if (user.points < pointsCost) {
      return res.status(400).json({
        success: false,
        message: `You need ${pointsCost - user.points} more points to redeem this reward.`,
      });
    }

    reward.used = true;
    reward.redeemedAt = new Date();
    user.points -= pointsCost;
    user.markModified("rewards");
    await user.save();

    res.json({
      success: true,
      message: "Reward redeemed successfully.",
      points: user.points,
      dayStreak: user.dayStreak,
      rewards,
    });
  } catch {
    res.status(500).json({ success: false, message: "Reward redeem failed." });
  }
};

module.exports = { getRewards, redeemReward };
