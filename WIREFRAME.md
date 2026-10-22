# Promotion Performance Dashboard - Wireframe Spec

## Purpose and hierarchy

The page is an operational review surface for one promotion, not a marketing page. A persistent left sidebar anchors navigation. The primary read is the five-cell KPI strip immediately below the campaign identity and global filters; below it, the dashboard answers the five business questions in order. Each numbered section opens with a takeaway sentence, followed by evidence and a short decision-oriented "So what" line.

The visual treatment is intentionally low-fidelity: grayscale surfaces, thin borders, simple chart marks, and labels that describe the information. The displayed dataset is illustrative. Values that require transaction- or bet-level computation are labeled "Derived" rather than presented as known results.

## Desktop layout

- **Chrome:** Fixed 238 px left navigation with five numbered anchors and an illustrative-data/USD note. The top rule in the content column places the product label left, FLYCATCHER centered, and page context right.
- **Campaign identity:** Promotion name and mechanics sit above date-range and country controls. Keep the illustrative-data marker visible beside the title.
- **Five-second read:** One horizontal strip with activation rate, deposits driven, bonus liability, net contribution, and flagged-account count. Keep equal visual weight, with the activation rate first.
- **01 Popularity & adoption:** Eligible-to-activated funnel, daily/cumulative activation trend, and status mix. This starts with reach and moves toward behavior over time.
- **02 Financial exposure & return:** A compact four-value financial summary, followed by a contribution waterfall and completed-versus-forfeited comparison.
- **03 Projections:** Scenario segmented control above a 12-week projection with an uncertainty band; keep assumptions visible next to the chart.
- **04 Rollover fulfilment behaviour:** Category contribution comparison and completion histogram, then a ranked top-games region.
- **05 Irregular winning patterns:** Review count and signal filter above the account table. Selecting a row should open the account-detail drawer at the right with a bet timeline and reason list. The wireframe shows this drawer open as a layout preview.

## Chart choices and decisions

- **Funnel:** Eligible versus activated accounts makes adoption loss legible and supports promotion reach decisions.
- **Daily and cumulative area/line trend:** Daily volume shows timing; the cumulative curve shows the activation tail after the designated offer week.
- **Stacked bar:** Pending, active, completed, and forfeited share makes cohort status distribution scannable.
- **Waterfall:** Bonus-funded GGR, bonus cost, forfeited cost avoided, and net contribution reveal how promotion value is composed.
- **Scenario line with confidence band:** Communicates direction and uncertainty for uptake, cost, and revenue over 4-12 weeks.
- **Category bars:** Raw and contribution-adjusted wagering by game category show why qualifying play differs from stake volume.
- **Histogram:** Rollover completed divided by rollover requirement reveals where players stall or clear the requirement.
- **Review table and drawer:** A sortable/filterable queue is for prioritizing human review; the drawer provides account-level evidence without losing queue context.

## Responsive behavior

- **Desktop (over 1180 px):** Fixed sidebar; three-part adoption row; two-column analytical panels; review table beside the open drawer.
- **Tablet (621-900 px):** Sidebar becomes a horizontal, scrollable section nav. KPI strip wraps to three columns; charts remain paired where space permits. Review drawer moves below the horizontally scrollable table.
- **Mobile (620 px and below):** Filters use two columns; KPI strip becomes two columns with the flagged count spanning the row. All chart panels stack. The review table scrolls horizontally; account detail follows it as a full-width panel.

## Wireframe assumptions to confirm

- The campaign date window and available country list will come from the eventual seed dataset; controls are structural in this stage.
- Approximate deposits are activation count multiplied by average first deposit. Liability, wagering, GGR, cost, net contribution, projection outputs, and review scores must be derived from typed seed data in Stage 2.
- USD is the reporting currency. Any source-currency conversion needs an explicit assumed rate and disclosure.
- The sample review rows and chart marks are illustrative only. A flagged account is a review lead, not a conclusion.