import { redirect, type LoaderFunctionArgs, type RouteObject } from "react-router";
import { queryClient } from "../../app/queryClient";
import { makeDraftQuery } from "./draftApi";
import { makeDraftPath, makeResumePage } from "./draftUtils";
import { DraftErrorPage } from "./pages/DraftErrorPage";
import { EventStepPage } from "./pages/EventStepPage";
import { LinkPage } from "./pages/LinkPage";
import { OrganiserStepPage } from "./pages/OrganiserStepPage";
import { ReviewPage } from "./pages/ReviewPage";

/** Every page needs the draft first; the query cache makes sure it is fetched once. */
function loadDraft({ params }: LoaderFunctionArgs) {
  return queryClient.ensureQueryData(makeDraftQuery(params.token ?? ""));
}

/** `/aanvraag/<token>`: the first step that is not complete, or the review page. */
async function resume(args: LoaderFunctionArgs) {
  const draft = await loadDraft(args);
  return redirect(makeDraftPath(args.params.token ?? "", makeResumePage(draft)));
}

/** The review page needs both steps; otherwise it opens the first incomplete one. */
async function guardReview(args: LoaderFunctionArgs) {
  const draft = await loadDraft(args);
  const page = makeResumePage(draft);
  return page === "review" ? null : redirect(makeDraftPath(args.params.token ?? "", page));
}

export const draftRoute: RouteObject = {
  path: "aanvraag/:token",
  loader: loadDraft,
  errorElement: <DraftErrorPage />,
  children: [
    { index: true, loader: resume },
    { path: "link", loader: loadDraft, element: <LinkPage /> },
    { path: "organisator", loader: loadDraft, element: <OrganiserStepPage /> },
    { path: "evenement", loader: loadDraft, element: <EventStepPage /> },
    { path: "controleren", loader: guardReview, element: <ReviewPage /> },
  ],
};
