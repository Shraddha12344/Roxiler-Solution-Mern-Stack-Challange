import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    dateOfSale: { type: Date, required: true },
    sold: { type: Boolean, required: true },
    image: { type: String, required: true },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
