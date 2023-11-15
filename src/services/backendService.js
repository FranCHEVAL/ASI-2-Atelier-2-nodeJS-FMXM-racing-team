import fetch from 'node-fetch';

export function makeBackendRequest() {
  const backendUrl = 'http://localhost:8084/cards';

  return fetch(backendUrl)
    .then(response => response.json())
    .catch(error => {
        console.error('Error making backend request:', error);
        throw error;
    });
}