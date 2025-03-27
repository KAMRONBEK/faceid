import { Card } from '@mui/material';
import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';

interface BlankCardProps {
  children: ReactNode;
  className?: string;
}

const BlankCard = ({ children, className }: BlankCardProps) => {
  return (
    <Card
      sx={{ p: 0, position: 'relative' }}
      className={className}
      elevation={9}
      variant={undefined}
    >
      {children}
    </Card>
  );
};

BlankCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default BlankCard;
