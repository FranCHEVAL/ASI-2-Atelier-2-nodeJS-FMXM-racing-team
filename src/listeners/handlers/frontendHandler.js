// frontendHandler.js
import { makeBackendRequest } from '../../services/backendService.js';

export async function handleFrontendRequest(req, res) {
  try {
    const requestData = req.body;
    const backendResponse = await makeBackendRequest(requestData);
    res.json({ success: true, data: backendResponse });
    console.log('Frontend request handled successfully');
  } catch (error) {
    console.error('Error handling frontend request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
