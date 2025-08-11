
import { type NextRequest, NextResponse } from "next/server"
import  { getDatabase } from "../../../lib/mongodb"


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const db = await getDatabase();
        const collection = db.collection("webSubmissions");

        // console.log(body);
        // Check for existing PRN
        const existing = await collection.findOne({prn:body.formData.prn});
        // console.log(existing)
        if (existing) {
            return NextResponse.json({ status: 409, error: "Submission already exists for this PRN." });
        }

        const now = new Date();
        const result = await collection.insertOne({
            ...body,
            submittedAt: now,
            submittedAtTime: now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        });
        return NextResponse.json({ status: 200, insertedId: result.insertedId });
    } catch (error) {
        console.error("Error saving submission:", error);
        return NextResponse.json({ status: 500, error: "Failed to save submission" });
    }
}