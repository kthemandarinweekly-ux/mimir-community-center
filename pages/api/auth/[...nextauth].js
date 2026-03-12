import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const upsertAirtableUser = async ({ email, name }) => {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_USERS_TABLE_NAME || "Users";
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey || !email) {
    return;
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
  const filter = `filterByFormula=${encodeURIComponent(`{Email}='${email}'`)}`;

  try {
    const lookupResponse = await fetch(`${baseUrl}?${filter}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!lookupResponse.ok) {
      return;
    }

    const lookupData = await lookupResponse.json();
    const existingRecord = lookupData.records?.[0];
    const lastSignInAt = new Date().toISOString();

    if (existingRecord) {
      await fetch(`${baseUrl}/${existingRecord.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            Name: name || existingRecord.fields.Name || "",
            LastSignInAt: lastSignInAt,
          },
        }),
      });
      return;
    }

    await fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              Email: email,
              Name: name || "",
              CreatedAt: lastSignInAt,
              LastSignInAt: lastSignInAt,
            },
          },
        ],
      }),
    });
  } catch (error) {
    console.error("Airtable sync failed:", error);
  }
};

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
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const normalizedEmail = credentials.email.trim().toLowerCase();
      const demoEmail = process.env.DEMO_EMAIL;
      const demoPassword = process.env.DEMO_PASSWORD;
      const adminLoginEmail = process.env.ADMIN_LOGIN_EMAIL;
      const adminLoginPassword = process.env.ADMIN_LOGIN_PASSWORD;
      const credentialAccounts = [];

      if (adminLoginEmail && adminLoginPassword) {
        credentialAccounts.push({
          id: "admin-credential-user",
          name: "Admin",
          email: adminLoginEmail,
          password: adminLoginPassword,
        });
      }

      if (demoEmail && demoPassword) {
        credentialAccounts.push({
          id: "demo-user",
          name: "Demo Member",
          email: demoEmail,
          password: demoPassword,
        });
      }

      const matchedAccount = credentialAccounts.find(
        (account) =>
          account.email.toLowerCase() === normalizedEmail &&
          account.password === credentials.password
      );

      if (matchedAccount) {
        return {
          id: matchedAccount.id,
          name: matchedAccount.name,
          email: matchedAccount.email,
        };
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
  events: {
    async signIn({ user }) {
      await upsertAirtableUser({ email: user?.email, name: user?.name });
    },
  },
  pages: {
    signIn: "/signin",
  },
});
