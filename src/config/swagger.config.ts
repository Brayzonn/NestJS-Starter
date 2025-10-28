import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Music Analytics API')
  .setDescription(
    'A comprehensive music analytics API for Spotify users. Track listening habits, generate reports, and discover music patterns.',
  )
  .setVersion('1.0.0')
  .setContact(
    'API Support',
    'https://github.com/yourusername/music-analytics-api',
    'support@musicanalytics.com',
  )
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addServer('http://localhost:3000', 'Development server')
  .addServer('https://api.musicanalytics.com', 'Production server')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .addOAuth2(
    {
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: 'https://accounts.spotify.com/authorize',
          tokenUrl: 'https://accounts.spotify.com/api/token',
          scopes: {
            'user-read-recently-played': 'Read recently played tracks',
            'user-read-playback-state': 'Read playback state',
            'user-read-currently-playing': 'Read currently playing track',
          },
        },
      },
    },
    'spotify-oauth',
  )
  .build();
