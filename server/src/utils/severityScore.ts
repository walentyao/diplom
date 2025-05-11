import { Op } from 'sequelize';
import Log from '../models/Log.js';

export async function calculateSeverityScore(log: Log): Promise<number> {
  let score = 0;

  // Add score based on level
  switch (log.level) {
    case 'critical':
      score += 10;
      break;
    case 'error':
      score += 5;
      break;
    case 'warn':
      score += 2;
      break;
  }

  // Add score for repeated errors in the last 30 minutes
  if (log.type === 'error' && log.fingerprint) {
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

    const repeatCount = await Log.count({
      where: {
        fingerprint: log.fingerprint,
        timestamp: {
          [Op.gte]: thirtyMinutesAgo
        }
      }
    });

    // Add 1 point for each repeat (including current log)
    score += repeatCount;
  }

  return score;
} 