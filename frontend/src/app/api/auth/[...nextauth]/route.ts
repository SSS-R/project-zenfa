import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        user?: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: string;
        }
    }
    interface User {
        accessToken?: string;
        role?: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const res = await fetch("http://127.0.0.1:8001/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password
                        })
                    });

                    const data = await res.json();

                    if (res.ok && data.access_token) {
                        // Decode JWT to extract role
                        let role = "user";
                        try {
                            const payloadBase64 = data.access_token.split('.')[1];
                            const payloadBuffer = Buffer.from(payloadBase64, 'base64');
                            const payload = JSON.parse(payloadBuffer.toString());
                            if (payload.role) {
                                role = payload.role;
                            }
                        } catch (e) {
                            console.error("Failed to decode token", e);
                        }

                        return {
                            id: data.access_token, // We'll store token as ID for now
                            email: credentials.email,
                            accessToken: data.access_token,
                            role: role
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.accessToken;
                // @ts-ignore
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            // @ts-ignore
            session.accessToken = token.accessToken;
            if (session.user) {
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_only"
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
