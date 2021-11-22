import '../styles/reset.scss';
import '../styles/global.scss';
import * as React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider, EmotionCache } from '@emotion/react';
import theme from '../lib/theme';
import createEmotionCache from '../lib/createEmotionCache';
import "@fontsource/roboto";
import ErrorHandler from '../components/ErrorHandler';
import { Err } from '../lib/server';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export type DefaultPageProps = {
  showError: (err : Err) => void;
};

export default function MyApp(props: MyAppProps) {
  const [err, setErr] = React.useState<null | Err>(null);

  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Code Analyzer</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      {/* <Router>
      <Switch>
        <Route exact path={`/index`} component={Index} />
      </Switch>
    </Router> */}
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <Component {...pageProps} showError={setErr} />
        <ErrorHandler err={err} onClose={() => setErr(null)}  />
      </ThemeProvider>
    </CacheProvider>
  );
}