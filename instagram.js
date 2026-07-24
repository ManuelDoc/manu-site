(() => {
  // Self-contained Instagram feed slider.
  //
  // Data source: a Behold.so JSON feed URL (https://behold.so). Behold connects
  // to a Business/Creator Instagram account through the official Graph API and
  // exposes a public JSON URL that is safe for the browser (the access token is
  // never sent to the client). Set it on the section via data-behold-url.
  //
  // If no URL is configured the module renders neutral placeholder tiles when
  // data-ig-demo="true" is present (used on staging to preview the design), and
  // otherwise removes itself so nothing broken is ever shown on the live site.

  const root = document.querySelector("[data-ig-feed]");
  if (!root) {
    return;
  }

  const track = root.querySelector("[data-ig-track]");
  const prevButton = root.querySelector("[data-ig-prev]");
  const nextButton = root.querySelector("[data-ig-next]");
  const feedUrl = (root.getAttribute("data-behold-url") || "").trim();
  const isDemo = root.getAttribute("data-ig-demo") === "true";
  const maxPosts = 6;
  const profileUrl = "https://www.instagram.com/manueldocampoweb/";
  const motionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

  const t = {
    view: root.getAttribute("data-i18n-view") || "View Instagram post",
    prev: root.getAttribute("data-i18n-prev") || "Previous posts",
    next: root.getAttribute("data-i18n-next") || "Next posts",
    tab: root.getAttribute("data-i18n-newtab") || "opens in a new tab",
    demo: root.getAttribute("data-i18n-demo") || "Sample post",
  };

  // --- Data helpers ---------------------------------------------------------

  // Behold's schema has shifted over time, so read defensively.
  const pickImage = (post) => {
    if (!post || typeof post !== "object") {
      return "";
    }
    const sizes = post.sizes || {};
    // Prefer Behold's cached sizes (behold.pictures — permanent) over the
    // top-level mediaUrl/thumbnailUrl, which are Instagram CDN URLs that expire.
    return (
      (sizes.medium && sizes.medium.mediaUrl) ||
      (sizes.large && sizes.large.mediaUrl) ||
      (sizes.small && sizes.small.mediaUrl) ||
      (sizes.full && sizes.full.mediaUrl) ||
      post.thumbnailUrl ||
      post.mediaUrl ||
      ""
    );
  };

  const pickCaption = (post) => {
    if (!post) {
      return "";
    }
    // prunedCaption is the caption without hashtags/mentions — cleaner for
    // alt text and aria labels. Fall back to the raw caption.
    const raw =
      post.prunedCaption ||
      (typeof post.caption === "string"
        ? post.caption
        : (post.caption && post.caption.text) || "");
    return raw.replace(/\s+/g, " ").trim();
  };

  const pickPermalink = (post) => (post && post.permalink) || profileUrl;

  const isVideo = (post) =>
    !!post && (post.mediaType === "VIDEO" || post.mediaType === "REEL");

  const excerpt = (text, max) => {
    if (!text) {
      return "";
    }
    return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
  };

  // --- Rendering ------------------------------------------------------------

  const buildCard = (post, index) => {
    const item = document.createElement("li");
    item.className = "ig-feed__item";

    const link = document.createElement("a");
    link.className = "ig-feed__link";
    link.href = pickPermalink(post);
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const caption = pickCaption(post);
    const label = caption ? excerpt(caption, 90) : t.view;
    link.setAttribute("aria-label", label + " — " + t.tab);

    const frame = document.createElement("span");
    frame.className = "ig-feed__frame";

    const img = document.createElement("img");
    img.className = "ig-feed__image";
    img.src = pickImage(post);
    img.alt = caption ? excerpt(caption, 120) : "";
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 800;
    img.height = 1000;
    frame.appendChild(img);

    if (isVideo(post)) {
      const badge = document.createElement("span");
      badge.className = "ig-feed__badge";
      badge.setAttribute("aria-hidden", "true");
      badge.innerHTML =
        '<svg viewBox="0 0 24 24" focusable="false"><path d="M8 5.5v13l11-6.5-11-6.5Z"></path></svg>';
      frame.appendChild(badge);
    }

    link.appendChild(frame);
    item.appendChild(link);
    return item;
  };

  // Neutral branded placeholder tiles for the staging preview.
  const buildDemoPost = (index) => {
    const hues = [
      ["#2dd4bf", "#38bdf8"],
      ["#38bdf8", "#6ee7b7"],
      ["#6ee7b7", "#2dd4bf"],
      ["#8df5e4", "#38bdf8"],
      ["#2dd4bf", "#8df5e4"],
      ["#38bdf8", "#2dd4bf"],
    ][index % 6];
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + hues[0] + '"/>' +
      '<stop offset="1" stop-color="' + hues[1] + '"/>' +
      "</linearGradient></defs>" +
      '<rect width="800" height="1000" fill="url(#g)"/>' +
      '<g fill="none" stroke="rgba(4,17,31,0.5)" stroke-width="14" stroke-linejoin="round" stroke-linecap="round">' +
      '<rect x="290" y="390" width="220" height="220" rx="56"/>' +
      '<circle cx="400" cy="500" r="54"/>' +
      '<circle cx="482" cy="412" r="12" fill="rgba(4,17,31,0.5)" stroke="none"/>' +
      "</g></svg>";
    return {
      permalink: profileUrl,
      mediaType: "IMAGE",
      caption: t.demo + " " + (index + 1),
      sizes: {
        medium: { mediaUrl: "data:image/svg+xml;utf8," + encodeURIComponent(svg) },
      },
    };
  };

  const renderPosts = (posts) => {
    track.textContent = "";
    posts.slice(0, maxPosts).forEach((post, index) => {
      track.appendChild(buildCard(post, index));
    });
    root.classList.add("is-ready");
    requestAnimationFrame(updateControls);
  };

  const showFallback = () => {
    // No posts and not in demo mode: hide the whole section quietly.
    root.setAttribute("hidden", "");
  };

  // --- Slider controls ------------------------------------------------------

  const scrollByCards = (direction) => {
    const firstItem = track.querySelector(".ig-feed__item");
    const step = firstItem
      ? firstItem.getBoundingClientRect().width + 16
      : track.clientWidth * 0.8;
    track.scrollBy({
      left: direction * step,
      behavior: motionQuery && motionQuery.matches ? "auto" : "smooth",
    });
  };

  const updateControls = () => {
    if (!prevButton || !nextButton) {
      return;
    }
    const maxScroll = track.scrollWidth - track.clientWidth - 2;
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft >= maxScroll;
    const overflowing = track.scrollWidth > track.clientWidth + 4;

    [prevButton, nextButton].forEach((btn) => {
      btn.hidden = !overflowing;
    });
    prevButton.disabled = atStart;
    nextButton.disabled = atEnd;
  };

  if (prevButton) {
    prevButton.addEventListener("click", () => scrollByCards(-1));
  }
  if (nextButton) {
    nextButton.addEventListener("click", () => scrollByCards(1));
  }
  track.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateControls);
  }, { passive: true });
  window.addEventListener("resize", () => {
    window.requestAnimationFrame(updateControls);
  });

  // --- Boot -----------------------------------------------------------------

  const boot = () => {
    if (feedUrl) {
      fetch(feedUrl, { headers: { Accept: "application/json" } })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Feed request failed: " + response.status);
          }
          return response.json();
        })
        .then((data) => {
          const posts = Array.isArray(data) ? data : data && data.posts;
          if (Array.isArray(posts) && posts.length) {
            renderPosts(posts);
          } else {
            showFallback();
          }
        })
        .catch(() => {
          showFallback();
        });
      return;
    }

    if (isDemo) {
      renderPosts(Array.from({ length: maxPosts }, (_, i) => buildDemoPost(i)));
      return;
    }

    showFallback();
  };

  boot();
})();
