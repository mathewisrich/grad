import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isMnAuthenticated } from "@/lib/auth";
import { getMnPhotos, publicUrl } from "@/lib/photos";
import Gallery from "@/components/Gallery";

export const metadata: Metadata = {
  title: "M & N · Gallery",
  robots: { index: false, follow: false },
};

export default async function MnGalleryPage() {
  if (!(await isMnAuthenticated())) {
    redirect("/m&n");
  }
  const photos = getMnPhotos().map((p) => ({
    name: p.name,
    full: publicUrl(p.full),
    thumb: publicUrl(p.thumb),
    width: p.width,
    height: p.height,
  }));

  return (
    <Gallery
      photos={photos}
      config={{
        namespace: "mn",
        zipAllName: "mathew-and-naa-all.zip",
        zipSelectedPrefix: "mathew-and-naa",
        backHref: null,
        logoutEndpoint: "/api/auth-mn",
        homeHref: "/m&n",
      }}
    />
  );
}
