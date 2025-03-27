import PropTypes from 'prop-types';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import { Box, styled, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

const SimpleBarStyle = styled(SimpleBar)(() => ({
  maxHeight: '100%',
  '.simplebar-scrollbar:before': { backgroundColor: '#2e2d348f' },
}));

interface ScrollbarProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
  [key: string]: any;
}

const Scrollbar = (props: ScrollbarProps) => {
  const { children, sx, ...other } = props;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );

  if (isMobile) {
    return <Box sx={{ overflowX: 'auto' }}>{children}</Box>;
  }

  return (
    <SimpleBarStyle sx={sx} {...other}>
      {children}
    </SimpleBarStyle>
  );
};

Scrollbar.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
  other: PropTypes.any,
};

export default Scrollbar;
