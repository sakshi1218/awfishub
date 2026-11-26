import ModulePage from '@/components/ui/ModulePage';
import TechnicalReportsContent from '@/components/technical/TechnicalReportsContent';

export default function TechnicalReportsPage() {
  return (
    <ModulePage pathname="/technical/reports" description="Technical updates, completed work, and project reports.">
      <TechnicalReportsContent />
    </ModulePage>
  );
}
