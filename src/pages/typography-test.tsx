import React from 'react';
import TypographyTest from '../components/TypographyTest';
import Head from 'next/head';

const TypographyTestPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Typography System Test</title>
        <meta name="description" content="Test page for the typography system" />
      </Head>
      <main>
        <TypographyTest />
      </main>
    </>
  );
};

export default TypographyTestPage; 