import { FC } from 'react';
import {
  Avatar,
  Box,
  Chip,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Badge } from '../../types/profile';

interface BadgeDisplayProps {
  badges: Badge[];
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
}

/**
 * Component to display user badges with tooltips for details
 */
const BadgeDisplay: FC<BadgeDisplayProps> = ({
  badges,
  size = 'medium',
  showLabels = true,
}) => {
  // Determine avatar size based on prop
  const getAvatarSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 48;
      default:
        return 32;
    }
  };

  // Calculate empty state message
  const emptyMessage =
    'No badges earned yet. Participate in the community to earn badges!';

  if (badges.length === 0) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  // Group badges by category for better organization
  const badgesByCategory = badges.reduce(
    (acc, badge) => {
      acc[badge.category] = acc[badge.category] || [];
      acc[badge.category].push(badge);
      return acc;
    },
    {} as Record<string, Badge[]>
  );

  return (
    <Box>
      {showLabels && (
        <Typography variant="h6" gutterBottom>
          Badges ({badges.length})
        </Typography>
      )}

      {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
        <Box key={category} mb={2}>
          {showLabels && (
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              {category.charAt(0) + category.slice(1).toLowerCase()}
            </Typography>
          )}

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {categoryBadges.map((badge) => (
              <Tooltip
                key={badge.id}
                title={
                  <>
                    <Typography variant="subtitle2">{badge.name}</Typography>
                    <Typography variant="body2">{badge.description}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                    </Typography>
                  </>
                }
                arrow
              >
                {showLabels ? (
                  <Chip
                    avatar={<Avatar src={badge.iconUrl} alt={badge.name} />}
                    label={badge.name}
                    color="primary"
                    variant="outlined"
                    size={size === 'small' ? 'small' : 'medium'}
                    sx={{ cursor: 'default' }}
                  />
                ) : (
                  <Avatar
                    src={badge.iconUrl}
                    alt={badge.name}
                    sx={{
                      width: getAvatarSize(),
                      height: getAvatarSize(),
                      cursor: 'default',
                    }}
                  />
                )}
              </Tooltip>
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  );
};

export default BadgeDisplay;
