import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Secure internal backend reference
const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8001";

// Create a quick schema for the swap request payload
const swapRequestSchema = z.object({
    build_id: z.string().uuid(),
    component_type: z.enum(["cpu", "gpu", "motherboard", "ram", "storage", "psu", "case", "cooler"]),
    // The ID of the item the user wants to swap TO
    new_component_id: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Zod Validation (Sanitization)
        const validatedData = swapRequestSchema.parse(body);

        // 2. Auth checking (Future Implementation)
        // const token = req.cookies.get('auth_token')?.value;

        // 3. Proxy to Python Backend
        const backendResponse = await fetch(`${BACKEND_URL}/api/v1/build/${validatedData.build_id}/swap`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                component_type: validatedData.component_type,
                new_component_id: validatedData.new_component_id
            }),
            cache: "no-store"
        });

        if (!backendResponse.ok) {
            console.error(`Backend returned ${backendResponse.status} for build swap`);
            return NextResponse.json(
                { error: "Failed to perform component swap." },
                { status: backendResponse.status }
            );
        }

        const data = await backendResponse.json();

        // Returns the updated build object and the new deducted token balance
        return NextResponse.json(data);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid swap payload.", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Internal Server Proxy Error (Swap):", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
