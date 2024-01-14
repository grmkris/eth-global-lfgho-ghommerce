/**
 * Injects an iframe into the website and initializes the TRPC client for the iframe.
 * The iframe is hidden by default.
 * @returns The TRPC client connected to the iframe.
 */
export const createIframe = (props: {
  url: string;
  modal?: boolean; // TODO - implement non-modal iframe
}): HTMLIFrameElement => {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.style.position = "fixed";
  iframe.style.width = "450px"; // Increased width
  iframe.style.height = "800px"; // Increased height
  iframe.style.left = "50%";
  iframe.style.top = "50%";
  iframe.style.transform = "translate(-50%, -50%)";
  iframe.style.border = "1px solid #ccc";
  iframe.style.borderRadius = "20px"; // Rounded corners
  iframe.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.25)"; // More pronounced shadow for depth
  iframe.style.zIndex = "1000";
  iframe.src = props.url;
  iframe.style.opacity = "0";
  iframe.style.transition = "opacity 0.5s ease, transform 0.5s ease";

  document.body.appendChild(iframe);

  return iframe;
};

// When showing the modal
export const showIframeModal = (iframe: HTMLIFrameElement): void => {
  if (!iframe) {
    console.error("Iframe has not been initialized.");
    return;
  }
  iframe.style.display = "block";
  requestAnimationFrame(() => {
    if (!iframe) throw new Error("Iframe has not been initialized.");
    iframe.style.opacity = "1";
    iframe.style.transform = "translate(-50%, -50%) scale(1)";
  });
};

// When hiding the modal
export const hideIframeModal = (iframe: HTMLIFrameElement): void => {
  if (!iframe) {
    console.error("Iframe has not been initialized.");
    return;
  }
  iframe.style.opacity = "0";
  iframe.style.transform = "translate(-50%, -50%) scale(0.95)";
  setTimeout(() => {
    if (!iframe) throw new Error("Iframe has not been initialized.");
    iframe.style.display = "none";
  }, 500); // Match the duration of the transition
};
