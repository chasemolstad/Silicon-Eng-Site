(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pixels = (value) => Number.parseFloat(value) || 0;

  document.querySelectorAll("main details").forEach((details) => {
    const summary = details.querySelector(":scope > summary");
    const panelContent = summary?.nextElementSibling;
    if (!summary || !panelContent) return;

    let isExpanded = details.open;
    let heightAnimation;
    let contentAnimation;

    summary.addEventListener("click", (event) => {
      event.preventDefault();

      const wasOpen = details.open;
      const currentHeight = details.getBoundingClientRect().height;
      const currentContentStyle = wasOpen ? getComputedStyle(panelContent) : null;
      const opening = !isExpanded;
      isExpanded = opening;
      heightAnimation?.cancel();
      contentAnimation?.cancel();

      if (reducedMotion || typeof details.animate !== "function") {
        details.open = opening;
        return;
      }

      const detailStyle = getComputedStyle(details);
      const borderHeight = pixels(detailStyle.borderTopWidth) + pixels(detailStyle.borderBottomWidth);
      const collapsedHeight = summary.getBoundingClientRect().height
        + pixels(detailStyle.paddingTop)
        + pixels(detailStyle.paddingBottom)
        + borderHeight;
      const timing = { duration: 750, easing: "cubic-bezier(.2,.65,.3,1)" };

      if (opening) {
        if (!details.open) details.open = true;
        const expandedHeight = details.getBoundingClientRect().height;
        heightAnimation = details.animate(
          [{ height: `${currentHeight}px` }, { height: `${expandedHeight}px` }],
          timing
        );
        contentAnimation = panelContent.animate(
          [
            { opacity: wasOpen ? currentContentStyle.opacity : 0, transform: wasOpen ? currentContentStyle.transform : "translateY(-8px)" },
            { opacity: 1, transform: "translateY(0)" }
          ],
          timing
        );
        return;
      }

      heightAnimation = details.animate(
        [{ height: `${currentHeight}px` }, { height: `${collapsedHeight}px` }],
        { ...timing, fill: "forwards" }
      );
      contentAnimation = panelContent.animate(
        [
          { opacity: currentContentStyle.opacity, transform: currentContentStyle.transform },
          { opacity: 0, transform: "translateY(-8px)" }
        ],
        { ...timing, fill: "forwards" }
      );

      const closingAnimation = heightAnimation;
      closingAnimation.onfinish = () => {
        if (isExpanded || heightAnimation !== closingAnimation) return;
        details.open = false;
        closingAnimation.cancel();
        contentAnimation?.cancel();
        heightAnimation = undefined;
        contentAnimation = undefined;
      };
    });
  });
})();
