import WarpcastReady from '@/components/WarpcastReady';
import { MoodWidget } from '@/components/MoodWidget';

export default function Home() {
  return (
    <main>
      {/* Monte le hook qui force sdk.actions.ready() */}
      <WarpcastReady />
      <MoodWidget />
    </main>
  );
}
