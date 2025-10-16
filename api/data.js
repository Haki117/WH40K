// Vercel serverless function for shared club data
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple in-memory storage (you can replace with a database later)
  if (!global.clubData) {
    global.clubData = {
      players: [],
      games: [],
      seasons: [],
      lastUpdated: new Date().toISOString()
    };
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        data: global.clubData
      });
    }

    if (req.method === 'POST') {
      const { type, data } = req.body;

      switch (type) {
        case 'players':
          global.clubData.players = data;
          break;
        case 'games':
          global.clubData.games = data;
          break;
        case 'seasons':
          global.clubData.seasons = data;
          break;
        case 'full':
          global.clubData = {
            ...data,
            lastUpdated: new Date().toISOString()
          };
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid data type'
          });
      }

      global.clubData.lastUpdated = new Date().toISOString();

      return res.status(200).json({
        success: true,
        message: 'Data saved successfully',
        lastUpdated: global.clubData.lastUpdated
      });
    }

    res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}