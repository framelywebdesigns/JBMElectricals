// api/content.js — Returns list of files in content folders via GitHub API

export default async function handler(req, res) {
    const { type } = req.query;

    if (!type || (type !== "gallery" && type !== "blog")) {
        res.status(400).json({ error: "Missing or invalid type parameter (must be 'gallery' or 'blog')" });
        return;
    }

    const repo   = "framelywebdesigns/JBMElectricals";
    const branch = "main";
    const path   = `content/${type}`;
    const url    = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;

    try {
        const ghRes = await fetch(url, {
            headers: {
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "JBM-Electrical-Site"
            }
        });

        if (!ghRes.ok) {
            res.status(ghRes.status).json({ error: `GitHub API error: ${ghRes.statusText}` });
            return;
        }

        const data = await ghRes.json();

        // Extract just the filename without extension
        const files = data
            .filter(f => f.type === "file")
            .map(f => f.name.replace(/\.(json|md)$/, ""));

        // Cache for 60 seconds (Vercel edge), allows quick updates after publish
        res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=30");
        res.status(200).json({ files });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
