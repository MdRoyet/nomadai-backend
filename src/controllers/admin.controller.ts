import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { Destination } from '../models/Destination.model';
import { asyncHandler } from '../utils/asyncHandler';

export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalDestinations,
    totalUsers,
    totalAdmins,
    categoryStats,
    priceStats,
    ratingDistribution,
    recentDestinations,
    recentUsers,
    monthlyGrowth,
    locationStats,
    topRated,
    priceByCategory,
  ] = await Promise.all([
    Destination.countDocuments(),
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),

    // Destinations per category
    Destination.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' }, avgRating: { $avg: '$rating' } } },
      { $sort: { count: -1 } },
    ]),

    // Price statistics
    Destination.aggregate([
      { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' }, avg: { $avg: '$price' }, total: { $sum: '$price' } } },
    ]),

    // Rating distribution
    Destination.aggregate([
      { $group: { _id: { $round: ['$rating', 0] }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]),

    // Recent 10 destinations
    Destination.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title price category rating location createdAt'),

    // Recent 10 users
    User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role createdAt'),

    // Monthly growth (last 12 months)
    Destination.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$price' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Top locations
    Destination.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),

    // Top rated destinations
    Destination.find()
      .sort({ rating: -1 })
      .limit(5)
      .select('title rating price location category'),

    // Price by category
    Destination.aggregate([
      { $group: { _id: '$category', min: { $min: '$price' }, max: { $max: '$price' }, avg: { $avg: '$price' } } },
    ]),
  ]);

  res.json({
    overview: {
      totalDestinations,
      totalUsers,
      totalAdmins,
      totalRevenue: priceStats[0]?.total || 0,
      avgPrice: Math.round(priceStats[0]?.avg || 0),
      minPrice: priceStats[0]?.min || 0,
      maxPrice: priceStats[0]?.max || 0,
    },
    categoryStats,
    ratingDistribution,
    recentDestinations,
    recentUsers,
    monthlyGrowth: monthlyGrowth.map((m) => ({
      month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
      count: m.count,
      revenue: m.revenue,
    })),
    locationStats,
    topRated,
    priceByCategory,
  });
});
