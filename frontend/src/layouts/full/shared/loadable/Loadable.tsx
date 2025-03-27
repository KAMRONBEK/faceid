import React, { Suspense, ComponentType, ReactElement } from "react";

const Loadable = <P extends object>(Component: ComponentType<P>) => (props: P): ReactElement => (
  <Suspense>
    <Component {...props} />
  </Suspense>
);

export default Loadable;
