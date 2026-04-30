import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { TMDB } from 'tmdb-ts';
import { ParsedQs } from 'qs';
import { AvailableLanguage } from 'tmdb-ts/dist/types/options';
import { SearchOptions } from 'tmdb-ts/dist/endpoints';
import { Request, RequestHandler, Response } from 'express-serve-static-core';

const tmdbAccessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMzJlZDZjZDg2NTM4ZGE2YzljOWEwZGRiM2NjYmIwYiIsIm5iZiI6MTQ1MTkxODk4OC41NzEsInN1YiI6IjU2OGE4NjhjYzNhMzY4NWY4OTAxNTA2YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.oyzhvAXJe1XfQTASeEGxrnrFPtz4bPcemyAXXsFYWcw';
const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

function getQueryParam<T extends string | number>(query: ParsedQs, paramName: string, type: 'string' | 'number'): T | undefined {
  let value: undefined | string | number | ParsedQs | (string | ParsedQs)[] = query[paramName];
  if (!value) {
    return undefined;
  }
  if (type === 'string') {
    return value as T || undefined;
  }
  if (type === 'number') {
    value = +value;
    if (!Number.isNaN(value)) {
      return value as T;
    }
  }
  return undefined;
}

function createSearchHandler<T extends keyof TMDB['search']>(method: T) {
  return async (
    req: Request<{}, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>, number>,
  ) => {
    const query = getQueryParam<string>(req.query, 'criteria', 'string');
    const page = getQueryParam<number>(req.query, 'page', 'number') || 1;
    const language = getQueryParam<AvailableLanguage>(req.query, 'language', 'string');

    if (!query) {
      return res.status(400).json({
        error: 'Missing or invalid "criteria" query parameter',
      });
    }

    const tmdb = new TMDB(tmdbAccessToken);

    try {
      const result = await tmdb.search[method]({
        query,
        page,
        language: language ?? 'hu-HU',
        include_adult: true,
      });

      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: 'TMDB error', details: err });
    }
  };
}

app.get('/api/search/multi', createSearchHandler('multi'));
app.get('/api/search/movies', createSearchHandler('movies'));
app.get('/api/search/tvShows', createSearchHandler('tvShows'));
app.get('/api/search/people', createSearchHandler('people'));

app.get('/api/movie', async (req, res) => {
  const id = getQueryParam<number>(req.query, 'id', 'number');
  const language = getQueryParam<AvailableLanguage>(req.query, 'language', 'string');
  if (id == undefined) {
    return res.status(400).json({
      error: 'Missing or invalid "id" query parameter',
    });
  }
  if (!language) {
    return res.status(400).json({
      error: 'Missing or invalid "language" query parameter',
    });
  }

  const tmdb = new TMDB(tmdbAccessToken);
  return res.json(await tmdb.movies.details(id, undefined, language));
});

app.get('/api/tvshow', async (req, res) => {
  const id = getQueryParam<number>(req.query, 'id', 'number');
  const language = getQueryParam<AvailableLanguage>(req.query, 'language', 'string');
  if (id == undefined) {
    return res.status(400).json({
      error: 'Missing or invalid "id" query parameter',
    });
  }
  if (!language) {
    return res.status(400).json({
      error: 'Missing or invalid "language" query parameter',
    });
  }

  const tmdb = new TMDB(tmdbAccessToken);
  return res.json(await tmdb.tvShows.details(id, undefined, language));
});

app.get('/api/people', async (req, res) => {
  const id = getQueryParam<number>(req.query, 'id', 'number');
  const language = getQueryParam<AvailableLanguage>(req.query, 'language', 'string');
  if (id == undefined) {
    return res.status(400).json({
      error: 'Missing or invalid "id" query parameter',
    });
  }
  if (!language) {
    return res.status(400).json({
      error: 'Missing or invalid "language" query parameter',
    });
  }

  const tmdb = new TMDB(tmdbAccessToken);
  return res.json(await tmdb.people.details(id, undefined, language));
});

app.get('/api/genres/movies', async (req, res) => {
  const tmdb = new TMDB(tmdbAccessToken);
  return res.json(await tmdb.genres.movies({ language: 'hu-HU' }));
});

app.get('/api/genres/tvShows', async (req, res) => {
  const tmdb = new TMDB(tmdbAccessToken);
  return res.json(await tmdb.genres.tvShows({ language: 'hu-HU' }));
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
