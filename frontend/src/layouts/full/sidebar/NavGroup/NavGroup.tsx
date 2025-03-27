import PropTypes from 'prop-types';
import React from 'react';
// mui imports
import { ListSubheader, styled } from '@mui/material';

interface NavGroupProps {
  item: {
    subheader: string;
  };
}

const NavGroup = ({ item }: NavGroupProps) => {
  const ListSubheaderStyle = styled((props: any) => <ListSubheader disableSticky {...props} />)(
    ({ theme }) => ({
      ...theme.typography.overline,
      fontWeight: '700',
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(0),
      color: theme.palette.text.primary,
      lineHeight: '26px',
      padding: '3px 12px',
    }),
  );
  return (
    <ListSubheaderStyle>{item.subheader}</ListSubheaderStyle>
  );
};

NavGroup.propTypes = {
  item: PropTypes.object,
};

export default NavGroup;
