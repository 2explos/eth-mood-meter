import WarpcastReady from '@/components/WarpcastReady';
import { MoodWidget } from '@/components/MoodWidget';

export default function Home() {
  return (
    <main>
      <WarpcastReady />
      <MoodWidget />
    </main>
  );
}
