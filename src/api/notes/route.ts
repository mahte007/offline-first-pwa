import {NextResponse} from 'next/server';
import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/offline-notes';

const connectDB = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGO_URI);
    }
}

const NoteSchema = new mongoose.Schema({
    text: String,
    date: String,
});
const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema);

export async function GET() {
    await connectDB();
    const notes = await Note.find();
    return NextResponse.json(notes)
}

export async function POST(request: Request) {
    await connectDB();
    const data = await request.json();
    const note = new Note(data);
    await note.save();
    return NextResponse.json(note);
}