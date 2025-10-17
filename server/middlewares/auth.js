import { clerkClient } from '@clerk/express';

export const auth = async (req, res, next) => {
  try {
    const { userId } = req.auth; // req.auth provided by Clerk middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user not logged in',
      });
    }

    const user = await clerkClient.users.getUser(userId);

    const hasPremiumPlan = user.privateMetadata?.plan === 'premium';
    let free_usage = user.privateMetadata?.free_usage ?? 0;

    if (!hasPremiumPlan) {
      req.free_usage = free_usage;
    } else {
      // Reset free_usage for premium users
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { ...user.privateMetadata, free_usage: 0 },
      });
      req.free_usage = 0;
    }

    req.plan = hasPremiumPlan ? 'premium' : 'free';
    req.userId = userId;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
