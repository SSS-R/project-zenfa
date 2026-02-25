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
            token_balance?: number;
            referral_code?: string;
        }
    }
    interface User {
        accessToken?: string;
        role?: string;
        token_balance?: number;
        referral_code?: string;
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
                        try {
                            const profileRes = await fetch("http://127.0.0.1:8001/auth/me", {
                                headers: { Authorization: `Bearer ${data.access_token}` },
                                // Do not cache this, to ensure accurate token balance
                                cache: 'no-store'
                            });

                            if (profileRes.ok) {
                                const profile = await profileRes.json();
                                return {
                                    id: data.access_token, // We'll store token as ID for now
                                    email: credentials.email,
                                    accessToken: data.access_token,
                                    role: profile.role,
                                    token_balance: profile.token_balance,
                                    referral_code: profile.referral_code
                                };
                            }
                        } catch (e) {
                            console.error("Failed to fetch profile", e);
                        }
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
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.accessToken = user.accessToken;
                // @ts-ignore
                token.role = user.role;
                // @ts-ignore
                token.token_balance = user.token_balance;
                // @ts-ignore
                token.referral_code = user.referral_code;
            }

            // Allow manual session updates from frontend
            if (trigger === "update" && session?.token_balance !== undefined) {
                token.token_balance = session.token_balance;
            }

            return token;
        },
        async session({ session, token }) {
            // @ts-ignore
            session.accessToken = token.accessToken;
            if (session.user) {
                // @ts-ignore
                session.user.role = token.role;
                // @ts-ignore
                session.user.token_balance = token.token_balance;
                // @ts-ignore
                session.user.referral_code = token.referral_code;
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
