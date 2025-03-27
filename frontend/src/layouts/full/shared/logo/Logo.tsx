import { Link } from 'react-router-dom';
import darkLogo from 'src/assets/images/logos/dark-logo.svg';
import { styled } from '@mui/material';

const LinkStyled = styled(Link)(() => ({
  height: '70px',
  width: '180px',
  overflow: 'hidden',
  display: 'block',
}));

// Import SVG as string to fix TypeScript error
const logoUrl = typeof darkLogo === 'string' ? darkLogo : '';

const Logo = () => {
  return (
    <LinkStyled to="/">
      <img src={logoUrl} alt="logo" height={70} />
    </LinkStyled>
  )
};

export default Logo;
