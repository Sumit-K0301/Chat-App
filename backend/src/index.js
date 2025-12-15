import 'dotenv/config';
import connectDB from './db/db.js';

import { server } from './app.js';

connectDB()
.then(() => {
    server.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
    })
})
.catch((error) => {
    console.error('Failed to connect to the database:', error);
});

