const CHANNEL_ID = "osm-api-auth-complete";

/**
 * resolves once the login flow in the popup is sucessful.
 * rejects if the popup is closed by the user or if there's an error.
 * @internal
 */
export function createPopup(loginUrl: string): Promise<string> {
  let resolved = false;
  return new Promise((resolve) => {
    const [width, height] = [600, 550];
    const settings = Object.entries({
      width,
      height,
      left: window.screen.width / 2 - width / 2,
      top: window.screen.height / 2 - height / 2,
    })
      .map(([k, v]) => `${k}=${v}`)
      .join(",");

    const popup = window.open("about:blank", "oauth_window", settings);
    if (!popup) throw new Error("Popup was blocked");
    popup.location = loginUrl;

    const bc = new BroadcastChannel(CHANNEL_ID);
    const onMessage = (event: MessageEvent) => {
      if (resolved) return; // already got a response
      resolve(event.data);
      resolved = true;
      bc.removeEventListener("message", onMessage);
      bc.close();
    };
    bc.addEventListener("message", onMessage);
  });
}
