import GuideView from "@/components/guide/GuideView";
import superuserGuide from "@/content/superuserGuide";

export const metadata = { title: "Help & Guide" };

export default function SuperuserGuidePage() {
  return <GuideView markdown={superuserGuide} />;
}
