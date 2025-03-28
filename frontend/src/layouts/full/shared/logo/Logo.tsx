import { Link } from 'react-router-dom';
import { styled, Typography, Box } from '@mui/material';

const LinkStyled = styled(Link)(() => ({
  height: '70px',
  width: '180px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none'
}));

// Base64 encoded SVG for Imtihon AI
const imtihonAiImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiM2MTVERkYiIG9wYWNpdHk9IjAuOCIvPgogIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjM1IiBmaWxsPSIjM0REOUVCIiBvcGFjaXR5PSIwLjYiLz4KICA8cGF0aCBkPSJNMzAgNDBMNTAgMzBMNzAgNDBMNzAgNjBMNTAgNzBMMzAgNjBMMzAgNDBaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxMCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIvPgogIDxwYXRoIGQ9Ik0zNSA3MEwzNSA4MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHBhdGggZD0iTTY1IDcwTDY1IDgwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8cGF0aCBkPSJNNDAgNzVMNjAgNzUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=';

const Logo = () => {
  return (
    <LinkStyled to="/">
      <img src={imtihonAiImage} alt="logo" height={45} />
      <Typography 
        variant="h5" 
        sx={{ 
          ml: 1, 
          fontWeight: 'bold',
          color: '#615DFF'
        }}
      >
        Imtihon AI
      </Typography>
    </LinkStyled>
  )
};

export default Logo;
