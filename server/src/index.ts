import express from 'express';
import expenseRoutes from './router/expense.routes'

const app = express();

app.use(express.json());
const PORT = 3000;

app.use('/api', expenseRoutes);
console.log(process.env.DATABASE_URL);
app.listen(PORT, () => {
    console.log(`server is running on port: ${PORT}`)
});
