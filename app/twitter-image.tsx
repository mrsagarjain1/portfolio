import { renderShareCard } from "./lib/shareCard";

export const alt =
  "Sagar Jain, Applied AI Engineer. Founder of valocoach.ai and Principal Engineer at Aadvik TekLabs.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return renderShareCard();
}
