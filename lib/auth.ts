import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { BASE_URL } from "./axios";
import type {
  AdminLoginResponse,
  MarchandLoginResponseItem,
  Feature,
  AccesMagasinPersonnel,
} from "@/app/types/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null;

        const headers = { "Content-Type": "application/json" };
        const requestedPlatform = (credentials as any).plateforme; // 'backoffice' or 'front'

        const tryLogin = async (platform: "backoffice" | "front") => {
          try {
            const body = JSON.stringify({
              email: credentials.login,
              password: credentials.password,
              plateforme: platform
            });
            const res = await fetch(`${BASE_URL}/login`, { method: "POST", headers, body });

            if (res.ok) {
              const result = await res.json();
              const { token, data } = result.data || {};

              if (token && data) {
                return {
                  id: String(data.id),
                  email: data.username || credentials.login,
                  name: data.nom || data.username,
                  token,
                  nom: data.nom,
                  username: data.username,
                  role: data.role,
                  roleLibelle: data.roleLibelle,
                  kind: platform === "backoffice" ? "admin" : "user",
                  type: data.type,
                  status: data.status,
                  personneId: data.personneId,
                  typePersonne: data.typePersonne,
                  payement: data.payement,
                  avatar: data.avatar,
                  finRenouvellement: data.finRenouvellement,
                  expire: data.expire,
                };
              }
            }
          } catch (err) {
            console.warn(`[auth] platform '${platform}' login error:`, err);
          }
          return null;
        };

        // If a platform is specified, try it first
        if (requestedPlatform === "backoffice") {
          const user = await tryLogin("backoffice");
          if (user) return user as any;
          return await tryLogin("front") as any;
        } else if (requestedPlatform === "front") {
          const user = await tryLogin("front");
          if (user) return user as any;
          return await tryLogin("backoffice") as any;
        }

        // Default behavior: try backoffice then front
        const adminUser = await tryLogin("backoffice");
        if (adminUser) return adminUser as any;

        const normalUser = await tryLogin("front");
        if (normalUser) return normalUser as any;

        console.error("[auth] Both platforms login failed");
        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 24 * 60 * 60, // 60 jours
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    // ── Persiste les champs dans le token JWT ────────────────────
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.apiToken = (user as any).token;
        token.nom = (user as any).nom;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.roleLibelle = (user as any).roleLibelle;
        token.kind = (user as any).kind;
        token.type = (user as any).type;
        token.status = (user as any).status;
        token.personneId = (user as any).personneId;
        token.typePersonne = (user as any).typePersonne;
        token.payement = (user as any).payement;
        token.avatar = (user as any).avatar;
        token.finRenouvellement = (user as any).finRenouvellement;
        token.expire = (user as any).expire;
      }

      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as any,
        email: token.email ?? "",
        token: token.apiToken as string,
        nom: token.nom as string,
        username: token.username as string,
        role: token.role as string,
        roleLibelle: token.roleLibelle as string,
        kind: token.kind as string,
        type: token.type as string,
        status: token.status as string,
        personneId: token.personneId as any,
        typePersonne: token.typePersonne as string,
        payement: token.payement,
        avatar: token.avatar as string,
        finRenouvellement: token.finRenouvellement as string,
        expire: token.expire as boolean,
      } as any;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};