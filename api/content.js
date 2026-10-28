// api/content.js — Returns list of files in content folders via GitHub API

export default async function handler(req, res) {
    const { type } = req.query;

    if (!type || (type !== "gallery" && type !== "blog")) {
        res.status(400).json({ error: "Missing or invalid type parameter (must be 'gallery' or 'blog')" });
        return;
    }

    // Read from the branch this deployment was built from, so a staging
    // preview lists the staged files. Vercel sets these variables on every
    // build; production (main) and any missing value fall back to the defaults.
    const owner  = process.env.VERCEL_GIT_REPO_OWNER || "framelywebdesigns";
    const slug   = process.env.VERCEL_GIT_REPO_SLUG  || "JBMElectricals";
    const repo   = `${owner}/${slug}`;
    const branch = process.env.VERCEL_GIT_COMMIT_REF || "main";
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

        // Cache for 5 minutes at the edge, 30 seconds stale-while-revalidate
        res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=30");
        res.status(200).json({ files });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
