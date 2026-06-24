import type { Metadata } from 'next';
import FaqPageContent from '../components/FaqPageContent';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about sync, Premium, offline mode, and more.',
};

export default function FaqPage() {
  return <FaqPageContent />;
}
