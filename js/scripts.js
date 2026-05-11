/*
 * JBM Electrical Contractors
 * scripts.js
 *
 * Sections:
 *   1. Loading Screen
 *   2. Header — Scroll Behaviour
 *   3. Mobile Navigation
 *   4. Enquiry Form Validation
 *   5. Testimonial Rotator
 *   6. Scroll Animations
 */

/* ── 1. LOADING SCREEN ───────────────────────────────── */
/* Only runs on first visit in a session — skipped on all internal navigation */
(function() {
    var loader = document.getElementById("loader");
    if (!loader) return;

    if (sessionStorage.getItem("jbm_visited")) {
        // Already visited — hide loader immediately, no animation
        loader.classList.add("gone");
        return;
    }

    // First visit — set the flag immediately then run the sequence
    sessionStorage.setItem("jbm_visited", "1");
    var ll = document.getElementById("ll");
    var lt = document.getElementById("lt");
    var lb = document.getElementById("lb");
    setTimeout(function(){ ll.classList.add("show"); lt.classList.add("show"); }, 300);
    setTimeout(function(){ lb.classList.add("run"); }, 450);
    setTimeout(function(){ loader.classList.add("out"); }, 2350);
    setTimeout(function(){ loader.classList.add("gone"); }, 3200);
})();

/* ── 2. HEADER — SCROLL BEHAVIOUR ────────────────────── */
var header = document.getElementById("header");
window.addEventListener("scroll", function() {
    if (header && header.getAttribute("data-locked")) return;
    var scrolled = window.scrollY > 20;
    header.classList.toggle("solid", scrolled);
}, {passive:true});

/* ── 3. MOBILE NAVIGATION ────────────────────────────── */
function toggleNav() {
    var nav = document.getElementById("mob-nav");
    var isOpen = nav.classList.toggle("open");
    document.body.style.overflow = isOpen ? "hidden" : "";
}
document.querySelectorAll("#mob-nav .mob-link").forEach(function(link) {
    link.addEventListener("click", function() {
        document.getElementById("mob-nav").classList.remove("open");
        document.body.style.overflow = "";
    });
});

/* ── 4. ENQUIRY FORM VALIDATION ──────────────────────── */
(function() {
    var form    = document.getElementById("enquiry-form");
    var success = document.getElementById("form-success");
    if (!form) return;

    function val(id) { return (document.getElementById(id)||{}).value||""; }
    function el(id)  { return document.getElementById(id); }

    function setErr(fieldId, errId, show) {
        var f = el(fieldId); var e = el(errId);
        if (!f || !e) return;
        f.classList.toggle("error", show);
        e.classList.toggle("show", show);
    }

    function validate() {
        var ok = true;
        // Name
        var name = val("f-name").trim();
        setErr("f-name", "err-name", !name); if (!name) ok = false;
        // Email
        var email = val("f-email").trim();
        var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        setErr("f-email", "err-email", !validEmail); if (!validEmail) ok = false;
        // Service
        var svc = val("f-service");
        setErr("f-service", "err-service", !svc); if (!svc) ok = false;
        // Message
        var msg = val("f-message").trim();
        setErr("f-message", "err-message", msg.length < 10); if (msg.length < 10) ok = false;
        // Consent
        var consent = el("f-consent") && el("f-consent").checked;
        var errConsent = el("err-consent");
        if (errConsent) errConsent.classList.toggle("show", !consent);
        if (!consent) ok = false;
        return ok;
    }

    // Live clear on input
    ["f-name","f-email","f-service","f-message"].forEach(function(id) {
        var field = el(id);
        if (!field) return;
        field.addEventListener("input", function() {
            field.classList.remove("error");
            var errId = "err-" + id.replace("f-","");
            var e = el(errId);
            if (e) e.classList.remove("show");
        });
    });
    var consent = el("f-consent");
    if (consent) consent.addEventListener("change", function() {
        var e = el("err-consent"); if (e) e.classList.remove("show");
    });

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        if (!validate()) return;
        // Simulate send — swap to real endpoint when ready
        var btn = el("form-btn");
        btn.textContent = "Sending…";
        btn.disabled = true;
        setTimeout(function() {
            form.style.display = "none";
            success.classList.add("show");
        }, 900);
    });
})();

/* ── 5. TESTIMONIAL ROTATOR ──────────────────────────── */
var testimonials = [
    {
        quote: "\u201cJBM handled the full electrical fit-out for our new manufacturing facility \u2014 3-phase power, motor control, high bay lighting and safety systems. The scope was significant and the timeline was tight. They delivered on schedule, on budget, and passed all compliance checks without a single issue.\u201d",
        avatar: "MR", name: "Michael R.", role: "General Manager, Manufacturing Facility"
    },
    {
        quote: "\u201cWe engaged JBM for our medical centre fit-out \u2014 lighting design, compliance wiring, and full installation. They communicated clearly throughout, managed every detail professionally and delivered on time. Extremely happy with the result.\u201d",
        avatar: "SC", name: "Sarah C.", role: "Practice Manager, Medical Centre"
    },
    {
        quote: "\u201cHad JBM install EV chargers and upgrade our switchboard at home. Clean work, no fuss, done faster than expected. The 20-year guarantee sealed it for us \u2014 would absolutely recommend to anyone looking for a reliable, professional electrician.\u201d",
        avatar: "DW", name: "David W.", role: "Homeowner, Melbourne"
    }
];
var currentTesti = 0;
var testiTimer = null;

function buildTesti() {
    var stack = document.getElementById("testi-stack");
    var dots  = document.getElementById("testi-dots");
    if (!stack || !dots) return;
    stack.innerHTML = "";
    dots.innerHTML  = "";
    testimonials.forEach(function(t, i) {
        // mini card
        var card = document.createElement("div");
        card.className = "testi-mini" + (i === currentTesti ? " active" : "");
        card.innerHTML =
            '<p class="testi-mini-quote">' + t.quote + '</p>' +
            '<div class="testi-mini-author">' +
              '<div class="t-mini-avatar">' + t.avatar + '</div>' +
              '<div><div class="t-mini-name">' + t.name + '</div>' +
              '<div class="t-mini-role">' + t.role + '</div></div>' +
            '</div>';
        card.addEventListener("click", function() { switchTesti(i); });
        stack.appendChild(card);
        // dot
        var dot = document.createElement("div");
        dot.className = "testi-dot" + (i === currentTesti ? " active" : "");
        dot.addEventListener("click", function() { switchTesti(i); });
        dots.appendChild(dot);
    });
}

function switchTesti(idx) {
    if (idx === currentTesti) return;
    var quote  = document.getElementById("testi-big-quote");
    var author = document.getElementById("testi-main-author");
    var avatar = document.getElementById("testi-avatar");
    var name   = document.getElementById("testi-name");
    var role   = document.getElementById("testi-role");
    // fade out
    quote.classList.add("fading");
    author.classList.add("fading");
    setTimeout(function() {
        currentTesti = idx;
        var t = testimonials[idx];
        quote.innerHTML  = t.quote;
        avatar.textContent = t.avatar;
        name.textContent   = t.name;
        role.textContent   = t.role;
        quote.classList.remove("fading");
        author.classList.remove("fading");
        buildTesti();
    }, 320);
    resetTimer();
}

function nextTesti() { switchTesti((currentTesti + 1) % testimonials.length); }

function resetTimer() {
    if (testiTimer) clearInterval(testiTimer);
    testiTimer = setInterval(nextTesti, 5000);
}

buildTesti();
resetTimer();

/* ── 6. SCROLL ANIMATIONS ────────────────────────────── */
var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
        }
    });
}, {threshold: 0.12});
document.querySelectorAll(".fade-up").forEach(function(el) {
    observer.observe(el);
});


/* ── 7. SERVICE PAGE — hash routing, render ──────────── */
(function() {
    if (!window.JBM_SERVICES) return;
    var contentEl = document.getElementById("service-content");
    if (!contentEl) return;

    function setHero(visible) {
        var hero = document.querySelector(".svc-hero");
        var header = document.getElementById("header");
        var wrap = document.querySelector(".sp-content-wrap");
        if (hero) hero.style.display = visible ? "" : "none";
        if (wrap) wrap.style.paddingTop = visible ? "" : "148px";
        if (header) {
            if (!visible) {
                header.classList.add("solid");
                header.setAttribute("data-locked", "1");
            } else {
                header.removeAttribute("data-locked");
                header.classList.toggle("solid", window.scrollY > 20);
            }
        }
    }

    function renderOverview() {
        setHero(true);
        var html = "<div class=\"sp-overview\">";
        html += "<p class=\"sp-overview-intro\">" + JBM_CATEGORY_INTRO + "</p>";
        html += "<div class=\"sp-overview-grid\">";
        Object.keys(JBM_SERVICES).forEach(function(id) {
            var s   = JBM_SERVICES[id];
            var snip = s.intro.split(".")[0] + ".";
            html += "<a href=\"#" + id + "\" class=\"sp-card\">";
            html += "<div class=\"sp-card-title\">" + s.title + "</div>";
            html += "<div class=\"sp-card-intro\">" + snip + "</div>";
            html += "<div class=\"sp-card-arrow\">View service <svg viewBox=\"0 0 24 24\"><path d=\"M5 12h14M12 5l7 7-7 7\"/></svg></div>";
            html += "</a>";
        });
        html += "</div></div>";
        contentEl.innerHTML = html;
    }

    function renderService(id) {
        var s = JBM_SERVICES[id];
        if (!s) { renderOverview(); return; }
        setHero(false);

        var itemsHtml = s.includes.map(function(item) {
            return "<div class=\"sp-includes-item\">" + item + "</div>";
        }).join("");

        var relHtml = "";
        if (s.related && s.related.length) {
            relHtml = "<div class=\"sp-related\">";
            relHtml += "<div class=\"sp-related-label\">Related Services</div>";
            relHtml += "<div class=\"sp-related-links\">";
            s.related.forEach(function(rid) {
                if (JBM_SERVICES[rid]) {
                    relHtml += "<a href=\"#" + rid + "\" class=\"sp-related-link\">" + JBM_SERVICES[rid].title + "</a>";
                }
            });
            relHtml += "</div></div>";
        }

        contentEl.innerHTML =
            "<div class=\"sp-detail\">" +
            "<div class=\"sp-detail-eyebrow\">" + JBM_CATEGORY + "</div>" +
            "<h2 class=\"sp-detail-title\">" + s.title + "</h2>" +
            "<p class=\"sp-detail-intro\">" + s.intro + "</p>" +
            "<div class=\"sp-includes-wrap\">" +
            "<div class=\"sp-includes-label\">What\'s Included</div>" +
            "<div class=\"sp-includes-grid\">" + itemsHtml + "</div>" +
            "</div>" +
            relHtml +
            "</div>";

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleHash() {
        var id = window.location.hash.slice(1);
        if (id && JBM_SERVICES[id]) { renderService(id); }
        else { renderOverview(); }
    }

    handleHash();
    window.addEventListener("hashchange", handleHash);
})();

/* ── 8. SERVICES — card swap + auto-rotation + overlay ── */
(function() {
    var CARDS = {
        "industrial-commercial": {
            label: "Industrial & Commercial",
            intro: "JBM works across Melbourne's commercial and industrial sectors. From shop fit-outs to heavy factory maintenance, the same standard applies to every job.",
            bullets: ["Factories, warehouses & fit-outs", "3 phase power & motor control", "Scheduled maintenance programs"],
            services: [
                { label: "Shop Fit-outs",                 href: "commercial.html#shop-fitouts" },
                { label: "Factory Maintenance & Repairs",  href: "industrial.html#factory-maintenance" },
                { label: "Motor Control Centres",          href: "industrial.html#motor-control-centres" }
            ]
        },
        "domestic": {
            label: "Domestic Services",
            intro: "Residential electrical work across Melbourne. Whether it is a single repair or a full switchboard upgrade, JBM handles it properly.",
            bullets: ["Power points, lighting & fans", "Switchboard upgrades & safety switches", "EV chargers & smart home"],
            services: [
                { label: "Power Points & Switches",    href: "domestic.html#power-points-switches" },
                { label: "Switchboard Upgrades",       href: "domestic.html#switchboard-upgrades" },
                { label: "EV Charger Supply & Install", href: "domestic.html#ev-charger" }
            ]
        },
        "rural-construction": {
            label: "Rural & Construction",
            intro: "JBM handles electrical work for new builds, rural properties and construction projects across Victoria.",
            bullets: ["New construction from rough-in to certification", "Rural properties & sheds", "Safety switches & compliance testing"],
            services: [
                { label: "New Construction Wiring",    href: "commercial.html#new-construction-wiring" },
                { label: "Shed & Office Power",        href: "industrial.html#shed-office-power" },
                { label: "Safety Switches & Testing",  href: "domestic.html#safety-switches" }
            ]
        },
        "ev-data": {
            label: "EV & Data Solutions",
            intro: "JBM installs EV chargers and data infrastructure for homes and businesses across Melbourne.",
            bullets: ["Home & commercial EV charger installs", "Hardwired data & network points", "Smart home & automation wiring"],
            services: [
                { label: "EV Charger Supply & Install", href: "domestic.html#ev-charger" },
                { label: "Network & Data Solutions",    href: "commercial.html#network-data" },
                { label: "Smart Home Automation",       href: "domestic.html#smart-home-automation" }
            ]
        }
    };

    /* State */
    var cards        = Array.from(document.querySelectorAll(".svc-card[data-card]"));
    var featuredCard = document.querySelector(".svc-featured");
    var openOverlay  = null;
    var isAnimating  = false;
    var rotTimer     = null;
    var isHovered    = false;

    if (!cards.length || !featuredCard) return;

    /* ── Rotation timer ── */
    function startRotation() {
        if (rotTimer) clearInterval(rotTimer);
        rotTimer = setInterval(function() {
            if (isAnimating || openOverlay || isHovered) return;
            var idx  = cards.indexOf(featuredCard);
            var next = cards[(idx + 1) % cards.length];
            flipToCard(next, null);
        }, 3000);
    }

    function stopRotation() {
        clearInterval(rotTimer);
        rotTimer = null;
    }

    /* ── FLIP animation — swap two cards, call cb when done ── */
    function flipToCard(nextCard, cb) {
        if (!nextCard || nextCard === featuredCard) { if (cb) cb(); return; }
        if (isAnimating) return;
        isAnimating = true;

        var prev = featuredCard;

        /* FIRST — record positions */
        var prevFirst = prev.getBoundingClientRect();
        var nextFirst = nextCard.getBoundingClientRect();

        /* LAST — swap classes */
        prev.classList.replace("svc-featured", "svc-small");
        nextCard.classList.replace("svc-small",    "svc-featured");
        featuredCard = nextCard;

        /* INVERT — push elements back to where they were visually */
        var prevLast = prev.getBoundingClientRect();
        var nextLast = nextCard.getBoundingClientRect();

        function invert(el, before, after) {
            var dx = before.left - after.left;
            var dy = before.top  - after.top;
            var sx = before.width  / after.width;
            var sy = before.height / after.height;
            el.style.transition      = "none";
            el.style.transformOrigin = "top left";
            el.style.transform       = "translate(" + dx + "px," + dy + "px) scaleX(" + sx + ") scaleY(" + sy + ")";
        }

        invert(prev,     prevFirst, prevLast);
        invert(nextCard, nextFirst, nextLast);

        /* PLAY — animate to final positions */
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                var ease = "transform 0.65s cubic-bezier(.25,0.1,.25,1)";
                prev.style.transition     = ease;
                prev.style.transform      = "";
                nextCard.style.transition = ease;
                nextCard.style.transform  = "";

                setTimeout(function() {
                    [prev, nextCard].forEach(function(c) {
                        c.style.transition      = "";
                        c.style.transformOrigin = "";
                        c.style.transform       = "";
                    });
                    isAnimating = false;
                    if (cb) cb();
                }, 680);
            });
        });
    }

    /* ── Content overlay ── */
    function closeOverlay(cb) {
        if (!openOverlay) { if (cb) cb(); return; }
        var ov = openOverlay;
        openOverlay = null;
        ov.classList.remove("show");
        if (ov.parentElement) ov.parentElement.classList.remove("content-open");
        setTimeout(function() {
            if (ov.parentElement) ov.parentElement.removeChild(ov);
            if (cb) cb();
        }, 380);
    }

    function showOverlay(card, key) {
        var data = CARDS[key];
        if (!data) return;

        var bulletsHtml = data.bullets.map(function(b) {
            return "<li class='svc-content-bullet'>" + b + "</li>";
        }).join("");

        var ov = document.createElement("div");
        ov.className = "svc-card-content";
        ov.innerHTML =
            "<button class='svc-content-close' title='Close'>&#215;</button>" +
            "<div class='svc-content-eyebrow'>" + data.label + "</div>" +
            "<p class='svc-content-intro'>" + data.intro + "</p>" +
            "<ul class='svc-content-bullets'>" + bulletsHtml + "</ul>" +
            "<div class='svc-content-links'>" +
            data.services.map(function(s) {
                return "<a href='" + s.href + "' class='svc-content-link'>" +
                    s.label +
                    "<svg viewBox='0 0 24 24'><path d='M5 12h14M12 5l7 7-7 7'/></svg>" +
                    "</a>";
            }).join("") +
            "</div>";

        card.appendChild(ov);
        card.classList.add("content-open");
        openOverlay = ov;

        /* Pause rotation while overlay is open */
        stopRotation();

        /* Pause on image, then slide up */
        setTimeout(function() {
            requestAnimationFrame(function() {
                requestAnimationFrame(function() { ov.classList.add("show"); });
            });
        }, 600);

        /* Close button — resume rotation after close */
        ov.querySelector(".svc-content-close").addEventListener("click", function(e) {
            e.stopPropagation();
            closeOverlay(function() {
                if (!isHovered) startRotation();
            });
        });
    }

    /* ── Card click handler ── */
    cards.forEach(function(card) {
        card.style.cursor = "pointer";
        card.addEventListener("click", function(e) {
            if (e.target.closest(".svc-content-link")) return;
            if (e.target.closest(".svc-content-close")) return;
            if (isAnimating) return;

            var key = card.getAttribute("data-card");

            /* Same card with overlay open → close overlay, resume rotation */
            if (openOverlay && openOverlay.parentElement === card) {
                closeOverlay(function() {
                    if (!isHovered) startRotation();
                });
                return;
            }

            /* Stop rotation, close any open overlay, swap if needed, show content */
            stopRotation();

            if (card === featuredCard) {
                closeOverlay(function() { showOverlay(card, key); });
            } else {
                closeOverlay(function() {
                    flipToCard(card, function() { showOverlay(card, key); });
                });
            }
        });
    });

    /* ── Hover pause ── */
    var section = document.getElementById("services");
    if (section) {
        section.addEventListener("mouseenter", function() {
            isHovered = true;
            stopRotation();
        });
        section.addEventListener("mouseleave", function() {
            isHovered = false;
            if (!openOverlay) startRotation();
        });
    }

    /* ── Start ── */
    startRotation();

})();


/* ── 9. HERO CROSSFADE ───────────────────────────────── */
(function() {
    var layers = document.querySelectorAll(".hero-bg");
    if (!layers.length) return;

    var current = 0;
    layers[current].classList.add("active");

    setInterval(function() {
        layers[current].classList.remove("active");
        current = (current + 1) % layers.length;
        layers[current].classList.add("active");
    }, 5000);
})();

/* ── IMAGE OPTIMISATION HELPER ──────────────────────── */
/* Wraps an image URL through Vercel's image optimisation endpoint.
   Falls back gracefully if running locally (no /_vercel/image available). */
function jbmOptImg(url, width, quality) {
    if (!url) return "";
    /* External URLs not on our site — return as-is */
    if (url.startsWith("http") && url.indexOf(window.location.hostname) === -1) return url;
    /* Local dev — Vercel optimisation only works in production */
    var isProduction = window.location.hostname.indexOf("vercel.app") !== -1
                    || window.location.hostname.indexOf("jbmelectrical") !== -1;
    if (!isProduction) return url;

    var w = width || 800;
    var q = quality || 75;
    return "/_vercel/image?url=" + encodeURIComponent(url) + "&w=" + w + "&q=" + q;
}

/* ── 9. FRONTMATTER PARSER (markdown handled by marked library) ── */
function jbmParseFrontmatter(text) {
    var match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (!match) return { meta: {}, body: text };
    var meta = {};
    match[1].split("\n").forEach(function(line) {
        var i = line.indexOf(":");
        if (i === -1) return;
        var key = line.slice(0, i).trim();
        var val = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
        meta[key] = val;
    });
    return { meta: meta, body: match[2] };
}

function jbmMarkdownToHtml(md) {
    /* marked is loaded from CDN in blog-post.html */
    if (typeof marked !== "undefined") {
        marked.setOptions({ gfm: true, breaks: false });
        return marked.parse(md);
    }
    /* Fallback: return raw text in a paragraph */
    return "<p>" + md.replace(/\n\n+/g, "</p><p>") + "</p>";
}

function jbmFormatDate(dateStr) {
    if (!dateStr) return "";
    var d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
}


/* ── 10. GALLERY ────────────────────────────────────── */
(function() {
    var grid = document.getElementById("gal-grid");
    if (!grid) return;

    var items = [];

    /* Step 1: get the list of files from the API, then load each one */
    var fetchUrl = window.JBM_GALLERY_FETCH || null;
    var filesPromise = fetchUrl
        ? fetch(fetchUrl).then(function(r) { return r.json(); }).then(function(d) { return d.files || []; })
        : Promise.resolve(window.JBM_GALLERY_FILES || []);

    filesPromise.then(function(slugs) {
        return Promise.all(slugs.map(function(slug) {
            return fetch("content/gallery/" + slug + ".json")
                .then(function(r) { return r.ok ? r.json() : null; })
                .catch(function() { return null; });
        }));
    }).then(function(results) {
        items = results.filter(function(x) { return x !== null; });
        items.sort(function(a, b) { return (b.date || "").localeCompare(a.date || ""); });
        renderGallery("all");
    }).catch(function() {
        items = [];
        renderGallery("all");
    });

    function renderGallery(filter) {
        var filtered = filter === "all" ? items : items.filter(function(i) { return i.category === filter; });

        if (!filtered.length) {
            grid.innerHTML =
                "<div class='gal-empty'>" +
                "<div class='gal-empty-title'>No photos yet</div>" +
                "<div class='gal-empty-desc'>Check back soon — we are adding new work all the time.</div>" +
                "</div>";
            return;
        }

        grid.innerHTML = filtered.map(function(item) {
            return "<div class='gal-item' data-title='" + escAttr(item.title) + "' data-cat='" + escAttr(item.category) + "' data-img='" + escAttr(item.image) + "'>" +
                "<img class='gal-item-img' src='" + escAttr(jbmOptImg(item.image, 640, 75)) + "' alt='" + escAttr(item.title) + "' loading='lazy' onerror=\"this.style.background='var(--off-white)'\">" +
                "<div class='gal-item-overlay'>" +
                "<div class='gal-item-cat'>" + escHtml(item.category) + "</div>" +
                "<div class='gal-item-title'>" + escHtml(item.title) + "</div>" +
                "</div>" +
                "</div>";
        }).join("");

        // Wire up lightbox clicks
        grid.querySelectorAll(".gal-item").forEach(function(el) {
            el.addEventListener("click", function() {
                openLightbox(el.getAttribute("data-img"), el.getAttribute("data-title"), el.getAttribute("data-cat"));
            });
        });
    }

    /* Filter buttons */
    document.querySelectorAll(".gal-filter-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
            document.querySelectorAll(".gal-filter-btn").forEach(function(b) { b.classList.remove("active"); });
            btn.classList.add("active");
            renderGallery(btn.getAttribute("data-filter"));
        });
    });

    /* Lightbox */
    var lightbox = document.getElementById("gal-lightbox");
    var lbImg    = document.getElementById("gal-lightbox-img");
    var lbCat    = document.getElementById("gal-lightbox-cat");
    var lbTitle  = document.getElementById("gal-lightbox-title");

    function openLightbox(src, title, cat) {
        lbImg.src = jbmOptImg(src, 1600, 85);
        lbImg.alt = title;
        lbCat.textContent = cat;
        lbTitle.textContent = title;
        lightbox.classList.add("show");
        document.body.style.overflow = "hidden";
    }
    function closeLightbox() {
        lightbox.classList.remove("show");
        document.body.style.overflow = "";
    }
    document.getElementById("gal-lightbox-close").addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function(e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", function(e) { if (e.key === "Escape") closeLightbox(); });

    function escHtml(s) { return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
    function escAttr(s) { return escHtml(s).replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
})();


/* ── 11. BLOG LISTING ──────────────────────────────── */
(function() {
    var grid = document.getElementById("blog-grid");
    if (!grid) return;

    var fetchUrl = window.JBM_BLOG_FETCH || null;
    var filesPromise = fetchUrl
        ? fetch(fetchUrl).then(function(r) { return r.json(); }).then(function(d) { return d.files || []; })
        : Promise.resolve(window.JBM_BLOG_FILES || []);

    filesPromise.then(function(slugs) {
        return Promise.all(slugs.map(function(slug) {
            return fetch("content/blog/" + slug + ".md")
                .then(function(r) { return r.ok ? r.text() : null; })
                .then(function(text) {
                    if (!text) return null;
                    var parsed = jbmParseFrontmatter(text);
                    parsed.meta.slug = slug;
                    return parsed.meta;
                })
                .catch(function() { return null; });
        }));
    }).then(function(posts) {
        posts = posts.filter(function(x) { return x !== null; });
        posts.sort(function(a, b) { return (b.date || "").localeCompare(a.date || ""); });

        if (!posts.length) {
            grid.innerHTML =
                "<div class='blog-empty'>" +
                "<div class='blog-empty-title'>No posts yet</div>" +
                "<div>Check back soon — new posts coming.</div>" +
                "</div>";
            return;
        }

        grid.innerHTML = posts.map(function(p) {
            return "<a href='blog-post.html?post=" + encodeURIComponent(p.slug) + "' class='blog-card'>" +
                "<div class='blog-card-img-wrap'>" +
                "<img class='blog-card-img' src='" + escAttr(jbmOptImg(p.cover || "", 640, 75)) + "' alt='" + escAttr(p.title) + "' loading='lazy' onerror=\"this.style.background='var(--light-gray)'\">" +
                "</div>" +
                "<div class='blog-card-body'>" +
                "<div class='blog-card-date'>" + jbmFormatDate(p.date) + "</div>" +
                "<div class='blog-card-title'>" + escHtml(p.title) + "</div>" +
                "<div class='blog-card-excerpt'>" + escHtml(p.excerpt || "") + "</div>" +
                "<span class='blog-card-link'>Read More <svg viewBox='0 0 24 24'><path d='M5 12h14M12 5l7 7-7 7'/></svg></span>" +
                "</div>" +
                "</a>";
        }).join("");
    });

    function escHtml(s) { return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
    function escAttr(s) { return escHtml(s).replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
})();


/* ── 12. SINGLE BLOG POST ─────────────────────────── */
(function() {
    var contentEl = document.getElementById("post-content");
    if (!contentEl) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get("post");

    if (!slug) {
        contentEl.innerHTML = "<div class='post-loading'>Post not found. <a href='blog.html' style='color:var(--amber)'>Back to blog</a></div>";
        return;
    }

    fetch("content/blog/" + slug + ".md")
        .then(function(r) {
            if (!r.ok) throw new Error("Not found");
            return r.text();
        })
        .then(function(text) {
            var parsed = jbmParseFrontmatter(text);
            var meta   = parsed.meta;

            // Update hero
            document.title = (meta.title || "Article") + " | JBM Electrical Contractors";
            var heroBg = document.getElementById("post-hero-bg");
            if (heroBg && meta.cover) heroBg.style.backgroundImage = "url('" + jbmOptImg(meta.cover, 1920, 80) + "')";
            document.getElementById("post-title").textContent     = meta.title || "Untitled";
            document.getElementById("post-crumb-title").textContent = meta.title || "Article";
            document.getElementById("post-date").textContent      = jbmFormatDate(meta.date);

            // Render body
            contentEl.innerHTML = jbmMarkdownToHtml(parsed.body);
        })
        .catch(function() {
            contentEl.innerHTML = "<div class='post-loading'>Post not found. <a href='blog.html' style='color:var(--amber)'>Back to blog</a></div>";
        });
})();
