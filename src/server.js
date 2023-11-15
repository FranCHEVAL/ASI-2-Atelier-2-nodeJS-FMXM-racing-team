import express from 'express';
import bodyParser from 'body-parser';
import { initListeners } from './listeners/frontend.js';

const app = express();
const PORT = 3100;

app.use(bodyParser.json());

initListeners(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});