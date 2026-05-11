// api/auth.js — Step 1: Redirect user to GitHub OAuth authorize page

export default function handler(req, res) {
    const clientId = process.env.OAUTH_CLIENT_ID;
    const host     = req.headers.host;
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const redirectUri = `${protocol}://${host}/api/callback`;

    const url =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=repo,user`;

    res.writeHead(302, { Location: url });
    res.end();
}
