import * as React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Button,
  Divider,
  Stack,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  AccessTime as AccessTimeIcon, 
  QuestionAnswer as QuestionAnswerIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

// Array of exam-related gradient backgrounds
const examBackgrounds = [
  'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
  'linear-gradient(135deg, #FF61D2 0%, #FE9090 100%)',
  'linear-gradient(135deg, #72EDF2 0%, #5151E5 100%)',
  'linear-gradient(135deg, #FAD961 0%, #F76B1C 100%)',
  'linear-gradient(135deg, #3B2667 0%, #BC78EC 100%)',
  'linear-gradient(135deg, #67B26F 0%, #4ca2cd 100%)',
];

export default function ExamCard({ exam }) {
  const { examName, duration, totalQuestions, examId, liveDate, deadDate } = exam;
  const theme = useTheme();
  
  // Use a random background from the array based on examId
  const backgroundIndex = examId ? examId.charCodeAt(0) % examBackgrounds.length : 0;
  const cardBackground = examBackgrounds[backgroundIndex];

  // Handle navigation
  const navigate = useNavigate();
  const isExamActive = true; // Date.now() >= liveDate && Date.now() <= deadDate;
  
  const handleCardClick = () => {
    if (isExamActive) {
      navigate(`/exam/${examId}`);
    }
  };

  // Format duration to display hours and minutes if needed
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}m` 
        : `${hours}h`;
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        width: '100%',
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
        },
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      {/* Header with background gradient */}
      <Box 
        sx={{ 
          background: cardBackground,
          height: { xs: '90px', sm: '110px', md: '120px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
            padding: '0 16px',
            textAlign: 'center',
            // Responsive font size based on breakpoints
            fontSize: { 
              xs: examName.length > 15 ? '1.25rem' : '1.5rem',
              sm: examName.length > 20 ? '1.5rem' : '1.75rem',
              md: examName.length > 25 ? '1.75rem' : '2rem'
            },
            lineHeight: 1.2
          }}
        >
          {examName}
        </Typography>
      </Box>

      {/* Card content */}
      <CardContent sx={{ 
        flexGrow: 1, 
        padding: { xs: 2, sm: 2.5, md: 3 },
        '&:last-child': { 
          paddingBottom: { xs: 2, sm: 2.5, md: 3 } 
        } 
      }}>
        {/* Use Stack instead of Grid for better responsive behavior */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={{ xs: 1.5, sm: 2 }}
          sx={{ mb: { xs: 2, sm: 2.5 } }}
        >
          {/* Questions info */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            minWidth: { sm: '50%' }
          }}>
            <QuestionAnswerIcon sx={{ 
              color: 'primary.main', 
              mr: { xs: 1, sm: 0.5, md: 1 },
              fontSize: { xs: '1.2rem', md: '1.3rem' } 
            }} />
            <Typography sx={{ 
              fontSize: { xs: '0.9rem', md: '1rem' } 
            }}>
              <strong>{totalQuestions}</strong> Questions
            </Typography>
          </Box>
          
          {/* Duration info */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            minWidth: { sm: '50%' }
          }}>
            <AccessTimeIcon sx={{ 
              color: 'secondary.main', 
              mr: { xs: 1, sm: 0.5, md: 1 },
              fontSize: { xs: '1.2rem', md: '1.3rem' } 
            }} />
            <Typography sx={{ 
              fontSize: { xs: '0.9rem', md: '1rem' } 
            }}>
              <strong>{formatDuration(duration)}</strong>
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: { xs: 1, sm: 1.5, md: 2 } }} />
        
        <Chip 
          label="Multiple Choice" 
          size="small" 
          color="primary" 
          variant="outlined" 
          sx={{ mb: { xs: 1, sm: 1.5, md: 2 }, fontSize: { xs: '0.7rem', sm: '0.75rem' } }} 
        />
        
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          onClick={handleCardClick}
          endIcon={<ArrowForwardIcon />}
          sx={{ 
            mt: { xs: 1, md: 1.5 }, 
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: { xs: '0.875rem', sm: '0.925rem', md: '1rem' },
            fontWeight: 'bold',
            padding: { xs: '8px 0', md: '10px 0' }
          }}
        >
          {isExamActive ? 'Start Exam' : 'View Details'}
        </Button>
      </CardContent>
    </Card>
  );
}
