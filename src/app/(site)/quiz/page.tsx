import { Metadata } from 'next';
import { TerritoryQuizClient } from './TerritoryQuizClient';

export const metadata: Metadata = {
  title: 'Discover Your Territory | Tarife Attär',
  description: 'Take our scent profile quiz to discover which territory speaks to your olfactory soul. Four territories. Your unique path.',
};

export default function QuizPage() {
  return <TerritoryQuizClient />;
}
