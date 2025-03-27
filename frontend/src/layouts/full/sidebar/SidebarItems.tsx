import React from 'react';
import Menuitems from './MenuItems';
import { useLocation } from 'react-router';
import { Box, List } from '@mui/material';
import NavItem from './NavItem';
import NavGroup from './NavGroup/NavGroup';
import { useAppSelector } from '../../../hooks/redux';

const SidebarItems = () => {
  const { userInfo } = useAppSelector((state) => state.auth);
  const { pathname } = useLocation();
  const pathDirect = pathname;

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {Menuitems.map((item) => {
          // Check if the user is a student and if the item should be hidden
          if (
            userInfo?.user && !userInfo.user.isTeacher &&
            ['Create Exam', 'Add Questions', 'Exam Logs'].includes(item.title || '')
          ) {
            return null; // Don't render this menu item for students
          }
          // {/********SubHeader**********/}
          if (item.subheader) {
            // Check if the user is a student and if the subheader should be hidden
            if (userInfo?.user && !userInfo.user.isTeacher && item.subheader === 'Teacher') {
              return null; // Don't render the "Teacher" subheader for students
            }

            return <NavGroup item={item} key={item.subheader} />;

            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else {
            // Cast the item to the expected type for NavItem
            const navItem = {
              id: item.id || '',
              title: item.title || '',
              icon: item.icon,
              href: item.href || '',
              external: false, // Default value
              disabled: false  // Default value
            };
            
            // Add a dummy onClick function to satisfy the requirement
            return (
              <NavItem 
                item={navItem} 
                key={item.id} 
                pathDirect={pathDirect} 
                onClick={() => {}} 
                level={0}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
