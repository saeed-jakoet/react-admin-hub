import { get } from "./fetcher";

// Fetch a signed URL for the happy letter template from the API
export async function getHappyLetterTemplateUrl(expires = 3600) {
  const res = await get(`/documents/template/happy-letter?expires=${expires}`);
  console.log(res);
  
  if (res?.status === "success" && res?.data?.url) {
    return res.data.url;
  }
  throw new Error(res?.message || "Failed to get template URL");
}
