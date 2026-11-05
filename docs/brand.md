# Teamingful brand

## The idea
You are blue, they are marigold, and where the two circles overlap is green: the team.

**Color always means who.**

| Color | Means | Used for |
| --- | --- | --- |
| Blue (you) | you, your items | capture button, your promises, avatar, active nav bar |
| Marigold (them) | them, their items | their promises, "promises this week" card |
| Green (team) | shared, the team | shared files, the overlap in the mark, event card |
| Ink | neutral, strong | primary buttons, headings, dark panels |

## Tokens (`tailwind.config.ts`)
| Token | Value | Notes |
| --- | --- | --- |
| ink | #121418 | text, primary buttons, dark panels |
| paper | #F7F8FA | page background (cards are white) |
| line | #E4E7EC | borders |
| muted | #5F6878 | secondary text |
| you / you-light | #2F5BFF / #EAF0FF | |
| them / them-light / them-text | #FFB627 / #FFF4DA / #8A5A00 | never white text on marigold; use them-text on them-light |
| team / team-light / team-text | #17A267 / #E4F6EC / #0D6B43 | |

## Fonts
- Headings: Bricolage Grotesque, weights 600 and 800. Big headlines use tight letter-spacing (about -0.03em).
- Everything else: Geist, weights 400, 500 and 600.

## Shapes
- Cards: white, 1px line border, 16px radius.
- Buttons are pills. Primary = ink with white text. Secondary = white with a line border. Capture = blue.

## Logo
`components/TeamMark.tsx`: two circles (blue left, marigold right), overlap filled green. Initials are white on blue and ink on marigold; for teams of 3+ the right circle shows the count. Wordmark: "teamingful" in lowercase, Bricolage 600 (`components/Logo.tsx`).

## Writing
Sentence case. No all-caps labels. No middle-dot separators in copy.
