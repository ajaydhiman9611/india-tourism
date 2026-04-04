// All runtime config is read from environment variables so that values can be
// overridden per environment without changing source code.
//
// Create a .env.local file at the project root (already gitignored) and set:
//   REACT_APP_API_URL=http://localhost:3000/api/v1
//   REACT_APP_GOOGLE_MAPS_API_KEY=<your key>

export const constants = {
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
    GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
}
