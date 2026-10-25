# Pre-launch regression review

This is an illustrative workflow, not an executed test or a claim about a real application. Replace all placeholders with observed project values.

## Request

"Review the saved onboarding run for the release candidate. Tell me what failed and whether the remembered navigation hint contributed. Do not start another test or change memory."

## Workflow

1. Match the supplied run ID to the onboarding test, staging target and release build. If the ID is missing, use `agent-qa runs list --limit 5 --json` and identify the matching record.
2. Read `agent-qa digest RUN_ID --json`, then `agent-qa runs overview RUN_ID --json`.
3. Inspect console/network evidence at the relevant zero-based test and step indexes. Retrieve an image only when its hash exists in the overview, exporting to a new path.
4. Read `agent-qa runs knowledge RUN_ID --json`. If it identifies a relevant hint, inspect that record's current state and provenance with `knowledge inspect` and `knowledge show`.
5. Report the recorded verdict, what the evidence supports, and what remains uncertain. Do not run tests, edit expectations or apply knowledge feedback during this review.

## Report outline

```text
Outcome: [recorded verdict and its scope]
Run / target / build: [observed values]
Selected journey: [test path or title from the record]
Evidence: [test index, step index, artifact or event]
Memory: [record ID, historical use, current state, provenance]
Interpretation: [supported cause, or unresolved possibilities]
Coverage gaps: [what this run did not verify]
Next action: [smallest justified step and any authorization needed]
```

If the hint is superseded now, that does not erase its use by the historical run. If evidence cannot show why navigation failed, report that uncertainty without reversing the recorded verdict. Keep private artifacts out of public reports.
