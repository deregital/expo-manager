import Greeting from '@/components/Greeting';

const Home = () => {
  console.log(process.env);

  return (
    <main className='flex h-full flex-col items-center justify-between p-24'>
      <Greeting />
    </main>
  );
};

export default Home;
