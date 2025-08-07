import express, {type Express} from 'express';
import env from './env.ts';

export const createServer = (): Express => {
    const app = express();
    const port = env().SERVER_PORT;
    app.use(express.json());
    app.listen(3000, () => {
        console.log('Server is running on http://localhost:3000');
    });
    app.get('/', (req, res) => {
        res.send('Service is running');
    });
    return app;
}