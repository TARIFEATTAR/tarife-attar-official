# Madison Studio Integration Report

## 1. Root Cause Analysis
We investigated why content generated in Madison Studio was not appearing in Sanity, specifically addressing the "Sync Failed" error (Status 500).

### Issue A: Content Visibility (Fixed)
*   **Diagnosis:** The content **was** successfully being created in Sanity (as drafts), but it was **invisible** in the Sanity Studio "Inbox".
*   **Reason:** The "Inbox" query in `src/sanity/structure.ts` was restricted to show only `product` types. It filtered out `journalEntry` and `fieldJournal` items.
*   **Resolution:** We updated the Desk Structure to include all Madison-generated types:
    ```typescript
    .filter('(_type == "product" || _type == "journalEntry" || _type == "fieldJournal") && generationSource == "madison-studio"')
    ```
*   **Status:** **FIXED** (Commit `2860e7c`).

### Issue B: "Sync Failed" (Status 500)
*   **Diagnosis:** The 500 error originates from the **Supabase Edge Function** (`push-to-sanity`), failing to communicate with the Next.js API.
*   **Likely Causes:**
    1.  **Missing Credentials:** The Edge Function configuration in Supabase is missing `MADISON_API_SECRET`.
    2.  **Incorrect URL:** The Edge Function is pointing to `localhost` (which it cannot reach from the cloud) or an incorrect production URL.
*   **Resolution:** Update Supabase Environment Variables (see below).

---

## 2. Integration Verification
We verified the Tarife Attar Next.js API (`/api/madison`) is healthy and functioning correctly.

*   **Test:** Sent a direct `curl` POST request to the local API mimicking Madison Studio.
*   **Result:** `HTTP 200 OK`
*   **Payload:**
    ```json
    {
      "success": true,
      "message": "journal draft created successfully",
      "draftId": "drafts.6f99027a..."
    }
    ```
*   **Conclusion:** The receiving end (Tarife Attar) is working perfectly. The break is in the transmission (Supabase).

---

## 3. Configuration & Mapping

### Category Mapping
Madison Studio categories should map to these exact Sanity values (lowercase):

**Journal Entries (`journalEntry`)**
| Madison Label | Sanity Value (`category`) |
| :--- | :--- |
| Field Notes | `field-notes` |
| Behind the Blend | `behind-the-blend` |
| Territory Spotlight | `territory-spotlight` |
| Collector Archives | `collector-archives` |

**Field Journals (`fieldJournal`)**
| Madison Label | Sanity Value (`category`) |
| :--- | :--- |
| Field Dispatch | `dispatch` |
| Distillation Log | `distillation` |
| Material Study | `material` |
| Territory Guide | `territory` |
| Archive Note | `archive` |

### Required Environment Variables (Next.js)
Ensure these are set in your Vercel/Hosting project:
*   `SANITY_API_WRITE_TOKEN`: Token with write permissions.
*   `MADISON_API_SECRET`: Secret key to authenticate requests.

---

## 4. Next Steps to Clear 500 Error
Since the Tarife Attar API is healthy, you must fix the **Supabase Edge Function** configuration:

1.  **Log in to Supabase Dashboard**.
2.  Go to **Edge Functions** > `push-to-sanity`.
3.  Check **Service Variables** / **Secrets**.
4.  Ensure `MADISON_API_SECRET` matches the value in your `.env`.
5.  Ensure `MADISON_SITE_URL` points to your **live production URL** (e.g., `https://tarifeattar.com` or `https://tarife-attar-site-redesign.vercel.app`), **NOT** localhost.

