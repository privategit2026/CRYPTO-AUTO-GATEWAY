import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';

const NotFound = () => (
  <PageContainer className="py-10">
    <PageHeader
      breadcrumbs={['CryptoGate', '404']}
      description="This admin dashboard is frontend-only. If you followed a stale link, use the navigation to get back on track."
      title="Page Not Found"
    />
    <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/55 p-6">
      <EmptyState description="The page you tried to open does not exist in this build." title="Nothing here" />
      <div className="mt-6 flex justify-center">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
          to="/"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  </PageContainer>
);

export default NotFound;

