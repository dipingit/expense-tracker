import express from 'express';
import cors from 'cors';
import expenseRoutes from './router/expense.routes';
import authRoutes from './router/auth.routes';
import categoryRoutes from './router/category.routes';
import userRoutes from './router/user.routes';

const app = express();

app.use(express.json());
app.use(cors());
const PORT = 3000;

app.use('/api', expenseRoutes);
app.use('/api', categoryRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
console.log(process.env.DATABASE_URL);
app.listen(PORT, () => {
    console.log(`server is running on port: ${PORT}`)
});
