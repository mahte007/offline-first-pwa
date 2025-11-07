import { NextResponse } from "next/server";
import mongoose from "mongoose";

/* const MONGO_URI = 'mongodb://localhost:27017/offline-notes';

const connectDB = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGO_URI);
    }
}

const NoteSchema = new mongoose.Schema({
    text: String,
    date: String,
});
const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema); */

interface Note {
  text: string;
  date: string;
}

const inMemoryNotes: Note[] = [];

export async function GET() {
  //await connectDB();
  //const notes = await Note.find();
  //return NextResponse.json(notes);
  return NextResponse.json(inMemoryNotes);
}

export async function POST(request: Request) {
  /* await connectDB();
    const data = await request.json();
    const note = new Note(data);
    await note.save();
    return NextResponse.json(note); */
  try {
    const data = await request.json();
    console.log("[MOCK API] Received note:", data);

    const note: Note = {
      text: data.text || "Untitled",
      date: data.date || new Date().toISOString(),
    };

    inMemoryNotes.push(note);

    return NextResponse.json({
      message: "note saved (mock)",
      data: note,
    });
  } catch (error) {
    console.error("[MOCK API] Error saving note:", error);
    return NextResponse.json(
      { message: "Failed to save note", error: String(error) },
      { status: 500 }
    );
  }
}
