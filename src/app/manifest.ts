import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Offline Jegyzet App",
    short_name: "JegyzetApp",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#123464",
  };
}
