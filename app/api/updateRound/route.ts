import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";


export async function POST(req: NextRequest) {
	try {
		const { studentId, round1Complete, round2Complete } = await req.json();
		if (!studentId) {
			return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
		}
		const db = await getDatabase();
		const students = db.collection("students");

		// Update the student document with round completion status
		const update: any = {};
		if (typeof round1Complete === "boolean") update.round1Complete = round1Complete;
		if (typeof round2Complete === "boolean") update.round2Complete = round2Complete;
		if (Object.keys(update).length === 0) {
			return NextResponse.json({ error: "No round status provided" }, { status: 400 });
		}

		const result = await students.updateOne(
			{ _id: new ObjectId(studentId) },
			{ $set: update }
		);
		if (result.matchedCount === 0) {
			return NextResponse.json({ error: "Student not found" }, { status: 404 });
		}
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating round status:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
