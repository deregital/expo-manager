import Greeting from '@/components/Greeting';

const Home = () => {
  return (
    <main className='flex h-full flex-col items-center justify-between p-24'>
      <Greeting
        process={`${process.env.VERCEL_URL}++${process.env.NEXT_PUBLIC_VERCEL_URL}`}
      />
    </main>
  );
};

export default Home;
