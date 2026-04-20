import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: string[];
  actions?: ReactNode;
}

const PageHeader = ({ title, description, breadcrumbs = ['CryptoGate'], actions }: PageHeaderProps) => (
  <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        {breadcrumbs.map((crumb, index) => (
          <span className="flex items-center gap-2" key={`${crumb}-${index}`}>
            {index > 0 && <span className="text-slate-700">/</span>}
            <span className={index === breadcrumbs.length - 1 ? 'text-cyan-300' : ''}>{crumb}</span>
          </span>
        ))}
      </nav>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
