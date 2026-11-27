import ModulePage from '@/components/ui/ModulePage';
import TechnicalProjectsContent from '@/components/technical/TechnicalProjectsContent';

export default function TechnicalProjectsPage() {
  return (
    <ModulePage pathname="/technical/projects" hideQuickLinks>
      <TechnicalProjectsContent />
    </ModulePage>
  );
}

