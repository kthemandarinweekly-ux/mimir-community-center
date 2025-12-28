import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

providers.push(
  CredentialsProvider({
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const demoEmail = process.env.DEMO_EMAIL;
      const demoPassword = process.env.DEMO_PASSWORD;

      if (!demoEmail || !demoPassword || !credentials) {
        return null;
      }

      if (credentials.email === demoEmail && credentials.password === demoPassword) {
        return { id: "demo-user", name: "Demo Member", email: demoEmail };
      }

      return null;
    },
  })
);

export default NextAuth({
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
});
