
## Important Dates

Atlassian Token Expires on Friday, 2nd January 2026

## Nice to Haves

* Allow checkbox selection for stories to add to be pointed
* Add an end of session summary screen
* Add a details summary screen for viewing past sessions


## Refactors

Implement the following state atoms to manage session and story identifiers throughout the application:

```tsx
export const sessionIdAtom = atom<string>("");
export const storyIdAtom = atom<string>("");
```

This will allow for removing the need to pass these IDs as props between components, simplifying the component hierarchy and improving maintainability.

The atoms already exist in `lib/state.ts`

## Bugs

**Timer Display Issue for Late Joiners**: When a user joins a session during an active timed vote, their timer display incorrectly resets to the full duration instead of showing the remaining time. For example, if a user joins with 10 seconds remaining on a 60-second timer, their display shows 60 seconds. However, the vote correctly ends after the actual 10 seconds.

**Selecting Stories**: You shouldn't be able to select the same story twice (maybe local filtering out selected stories)