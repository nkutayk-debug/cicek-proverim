import { getPrices } from "@/lib/prices";
import { llmsTxt } from "@/lib/llms";

export const revalidate = 21600;

export async function GET() {
  return new Response(llmsTxt(await getPrices()), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
