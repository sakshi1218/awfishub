import ModulePage from '@/components/ui/ModulePage';
import TechnicalDocumentationContent from '@/components/technical/TechnicalDocumentationContent';

export default function TechnicalDocumentationPage() {
  return (
    <ModulePage pathname="/technical/documentation" description="Project documentation and technical information organized for easy reference." hideQuickLinks>
      <TechnicalDocumentationContent />
    </ModulePage>
  );
}
