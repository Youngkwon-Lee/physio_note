import ReportsList from '@/components/ReportsList';

export default function ReportsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">평가 보고서</h1>
      <ReportsList />
    </div>
  );
} 