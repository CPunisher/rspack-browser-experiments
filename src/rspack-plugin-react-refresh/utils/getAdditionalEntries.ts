import { reactRefreshEntryPath } from "../paths";

export interface AdditionalEntries {
  prependEntries: string[];
}

export function getAdditionalEntries({
  devServer,
}: {
  // biome-ignore lint: complex
  devServer: any;
}): AdditionalEntries {
  const resourceQuery: Record<string, string | number> = {};

  if (devServer) {
    const { client, https, http2, sockHost, sockPath, sockPort } = devServer;
    let { host, path, port } = devServer;

    let protocol = https || http2 ? "https" : "http";
    if (sockHost) host = sockHost;
    if (sockPath) path = sockPath;
    if (sockPort) port = sockPort;

    if (client && client.webSocketURL != null) {
      let parsedUrl = client.webSocketURL;
      if (typeof parsedUrl === "string") parsedUrl = new URL(parsedUrl);

      let auth: string | undefined;
      if (parsedUrl.username) {
        auth = parsedUrl.username;
        if (parsedUrl.password) {
          auth += `:${parsedUrl.password}`;
        }
      }

      if (parsedUrl.hostname != null) {
        host = [auth != null && auth, parsedUrl.hostname]
          .filter(Boolean)
          .join("@");
      }
      if (parsedUrl.pathname != null) {
        path = parsedUrl.pathname;
      }
      if (parsedUrl.port != null) {
        port = !["0", "auto"].includes(String(parsedUrl.port))
          ? parsedUrl.port
          : undefined;
      }
      if (parsedUrl.protocol != null) {
        protocol =
          parsedUrl.protocol !== "auto"
            ? parsedUrl.protocol.replace(":", "")
            : "ws";
      }
    }

    if (host) resourceQuery.sockHost = host;
    if (path) resourceQuery.sockPath = path;
    if (port) resourceQuery.sockPort = port;
    resourceQuery.sockProtocol = protocol;
  }

  const prependEntries = [
    // React-refresh runtime
    reactRefreshEntryPath,
  ];

  return { prependEntries };
}
