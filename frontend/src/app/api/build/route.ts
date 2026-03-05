import { NextRequest, NextResponse } from "next/server";
import { buildRequestSchema } from "@/lib/schemas";
import { ZodError } from "zod";

// The backend URL is hidden from the client browser and only accessible to this Node process.
// We fall back to a local default if not in env for development purposes.
const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8001";

export async function POST(req: NextRequest) {
    try {
        // 1. Extract the raw JSON body from the client request
        const body = await req.json();

        // 2. Validate the payload against our pre-defined Zod schema to prevent malicious/malformed inputs
        const validatedData = buildRequestSchema.parse(body);

        // 3. Extract auth token from the Next.js HttpOnly cookies (to be implemented with Auth module)
        // const token = req.cookies.get('auth_token')?.value;

        // 4. Securely Forward the validated request to the internal b2c python backend
        const backendResponse = await fetch(`${BACKEND_URL}/api/v1/build/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // "Authorization": `Bearer ${token}` // Injected server-side
            },
            body: JSON.stringify(validatedData),
            // Important: We don't want Next.js to cache dynamic AI build responses
            cache: "no-store"
        });

        if (!backendResponse.ok) {
            // Forward error status securely without leaking internal stack traces
            console.error(`Backend returned ${backendResponse.status} for build/generate`);
            return NextResponse.json(
                { error: "Failed to generate build from engine." },
                { status: backendResponse.status }
            );
        }

        const data = await backendResponse.json();

        // 5. Return the generated build data back to the client
        return NextResponse.json(data);

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: "Invalid payload formatting.", details: error.issues },
                { status: 400 }
            );
        }

        console.error("Internal Server Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
