import type { ReactNode } from 'react';
import { cx } from './ui';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

// Fluid container: fills the available content width (after sidebar) to avoid large side gaps on desktop.
const PageContainer = ({ children, className }: PageContainerProps) => (
  <div className={cx('w-full px-4 py-6 sm:px-6 lg:px-8 2xl:px-10', className)}>{children}</div>
);

export default PageContainer;
