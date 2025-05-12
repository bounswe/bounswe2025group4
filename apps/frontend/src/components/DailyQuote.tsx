import { Card, CardContent, Typography, Skeleton, Alert } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { useTodayQuote } from '../services/quotes.service';
import { styled } from '@mui/material/styles';

const QuoteCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(2),
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -10,
    left: -10,
    width: 30,
    height: 30,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    opacity: 0.1,
  },
}));

const QuoteIcon = styled(FormatQuoteIcon)(({ theme }) => ({
  position: 'absolute',
  top: -15,
  left: -15,
  fontSize: 40,
  color: theme.palette.primary.main,
}));

export const DailyQuote = () => {
  const { data: quote, isLoading, isError } = useTodayQuote();

  if (isLoading) {
    return (
      <QuoteCard>
        <CardContent>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" width="60%" />
        </CardContent>
      </QuoteCard>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load today's inspiration. Please try again later.
      </Alert>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <QuoteCard elevation={2}>
      <QuoteIcon />
      <CardContent>
        <Typography
          variant="h6"
          component="p"
          gutterBottom
          sx={{
            fontStyle: 'italic',
            pl: 2,
          }}
        >
          {quote.q}
        </Typography>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{
            textAlign: 'right',
            mt: 1,
          }}
        >
          – {quote.a || 'Anonymous'}
        </Typography>
      </CardContent>
    </QuoteCard>
  );
};
