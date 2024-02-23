import Greeting from '@/components/Greeting';

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-between p-24">
      <Greeting />
    </main>
  );
}
