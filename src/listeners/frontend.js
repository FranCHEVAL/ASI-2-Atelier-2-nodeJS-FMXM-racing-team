import { handleFrontendRequest } from './handlers/frontendHandler.js';

function initListeners(app) {
    app.get('/cardsSelected', handleFrontendRequest);
}

export { initListeners };