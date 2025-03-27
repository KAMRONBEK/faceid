import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

interface PageContainerProps {
  title: string;
  description: string;
  children: ReactNode;
}

const PageContainer = ({ title, description, children }: PageContainerProps) => (
  <div>
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Helmet>
    {children}
  </div>
);

PageContainer.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node,
};

export default PageContainer;
