import dotenv from 'dotenv';

dotenv.config();

const env = () => {
    return {
        SERVER_PORT: process.env.SERVER_PORT || '3000',
    }
}

export default env;