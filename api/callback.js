// api/callback.js — Step 2: Exchange the GitHub code for a token, pass it to CMS

export default async function handler(req, res) {
    const { code } = req.query;

    if (!code) {
        res.status(400).send("Missing code parameter");
        return;
    }

    try {
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept":       "application/json"
            },
            body: JSON.stringify({
                client_id:     process.env.OAUTH_CLIENT_ID,
                client_secret: process.env.OAUTH_CLIENT_SECRET,
                code:          code
            })
        });

        const data = await tokenRes.json();

        if (data.error || !data.access_token) {
            const err = data.error_description || data.error || "Unknown error";
            res.status(400).send(renderResult("error", err));
            return;
        }

        // Send the token back to the CMS via postMessage
        res.setHeader("Content-Type", "text/html");
        res.send(renderResult("success", { token: data.access_token, provider: "github" }));
    } catch (err) {
        res.status(500).send(renderResult("error", err.message));
    }
}

function renderResult(status, payload) {
    const data = status === "success"
        ? `authorization:github:success:${JSON.stringify(payload)}`
        : `authorization:github:error:${JSON.stringify({ message: payload })}`;

    return `<!DOCTYPE html>
<html>
<head><title>Authorising...</title></head>
<body>
<script>
(function() {
    function receive(e) {
        if (!/^https?:\\/\\/.+$/.test(e.origin)) return;
        window.opener.postMessage(${JSON.stringify(data)}, e.origin);
        window.removeEventListener("message", receive, false);
    }
    window.addEventListener("message", receive, false);
    window.opener.postMessage("authorizing:github", "*");
})();
</script>
<p>Completing sign-in...</p>
</body>
</html>`;
}
