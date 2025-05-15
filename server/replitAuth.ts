import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Ensure we have the Replit domains environment variable
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

// Secret for signing session cookies
const SESSION_SECRET = process.env.SESSION_SECRET || "draperads-secret-key";

// Cache OpenID config to avoid repeated fetches
const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 } // Cache for 1 hour
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // Create table if it doesn't exist
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      maxAge: sessionTtl,
    },
  });
}

// Update user session with token information
function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

// Upsert user in our database with information from Replit
async function upsertUser(
  claims: any,
) {
  try {
    await storage.createUser({
      id: parseInt(claims["sub"]),
      username: claims["email"] || `user_${claims["sub"]}`,
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    });
  } catch (error) {
    console.error("Error upserting user:", error);
  }
}

export async function setupAuth(app: Express) {
  // Trust proxy headers (needed for secure cookies behind proxies)
  app.set("trust proxy", 1);
  
  // Set up session middleware
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Get OpenID configuration
  const config = await getOidcConfig();

  // Verification function for the Replit auth strategy
  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Set up auth strategies for all domains
  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  // Serialize and deserialize user for session storage
  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Login route - initiates the Replit auth flow
  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  // Callback route - handles the auth response from Replit
  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  // Logout route - ends the user session
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

// Middleware to check if a user is authenticated
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // If not authenticated or no expiration time, return unauthorized
  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ 
      message: "Unauthorized", 
      loginUrl: "/api/login" 
    });
  }

  // Check if the token is still valid
  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  // If token expired, try to refresh it
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ 
      message: "Session expired", 
      loginUrl: "/api/login" 
    });
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(401).json({ 
      message: "Authentication failed", 
      loginUrl: "/api/login" 
    });
  }
};