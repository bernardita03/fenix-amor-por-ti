declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ADMIN_EMAILS?: string;
    ACCESS_TEAM_DOMAIN?: string;
    ACCESS_AUD?: string;
    GOOGLE_CALENDAR_WEBHOOK_URL?: string;
    GOOGLE_CALENDAR_SHARED_SECRET?: string;
  }
}
