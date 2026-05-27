import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getPhotos, publicUrl } from "@/lib/photos";
import Gallery from "@/components/Gallery";

export default async function GalleryPage() {
  if (!(await isAuthenticated())) redirect("/");
  const photos = getPhotos().map((p) => ({
    name: p.name,
    full: publicUrl(p.full),
    thumb: publicUrl(p.thumb),
    width: p.width,
    height: p.height,
  }));

  return <Gallery photos={photos} />;
}
