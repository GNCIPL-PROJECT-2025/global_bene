import mongoose from "mongoose";

// Database Connection Function
const connectDB = async () => {
    try {
        const connectionString = process.env.MONGO_URI;
        console.log(`Attempting to connect to MongoDB with URI: ${connectionString.replace(/:([^:@]{1})[^:@]*@/, ':****@')}`);
        const connectionInstance = await mongoose.connect(connectionString);
        console.log(`\n✅ Database connected successfully!`);
    }

    catch (error) {
        console.log("Unable to connect to store--\nconnectionError: ", error);
        process.exit(1);
    }
}

export default connectDB;