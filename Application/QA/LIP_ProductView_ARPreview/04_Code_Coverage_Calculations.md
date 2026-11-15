# Code Coverage Calculations (LIP)

## Coverage Model Used
Because this submission is based on white-box basis path design (without instrumented runtime execution logs), coverage is reported as path-coverage contribution per test case.

- Let cyclomatic complexity for feature block be V(G).
- Minimum independent paths required = V(G).
- If one test case covers one unique independent path, per-test path coverage contribution:

PathCoveragePerTC = (1 / V(G)) * 100

- Cumulative path coverage after executing k unique independent paths:

CumulativePathCoverage = (k / V(G)) * 100

## Feature A: Product View + Attributes + Cart/Buy
Source: [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx)
Assumed basis paths for tested subset: V(G)=8

Path coverage contribution per test case:
- PV-TC-01: 12.50%
- PV-TC-02: 12.50%
- PV-TC-03: 12.50%
- PV-TC-04: 12.50%
- PV-TC-05: 12.50%
- PV-TC-06: 12.50%
- PV-TC-07: 12.50%
- PV-TC-08: 12.50%

Extended robustness tests (PV-TC-09 to PV-TC-14) increase branch confidence but are not required to satisfy minimum basis set once 8 unique paths are already covered.

Cumulative after basis-set execution:
- After 4 tests: 50.00%
- After 8 tests: 100.00%

## Feature B: AR Preview Button Routing
Source: [frontend/components/ARPreviewButton.tsx](frontend/components/ARPreviewButton.tsx)
V(G)=5

Path coverage contribution per test case:
- ARB-TC-01: 20.00%
- ARB-TC-02: 20.00%
- ARB-TC-03: 20.00%
- ARB-TC-04: 20.00%
- ARB-TC-05: 20.00%

Cumulative after basis-set execution:
- After 3 tests: 60.00%
- After 5 tests: 100.00%

## Feature C: AR Route Capability Gating
Source: [frontend/app/product/ar.tsx](frontend/app/product/ar.tsx)
V(G)=7

Path coverage contribution per test case:
- ARG-TC-01: 14.29%
- ARG-TC-02: 14.29%
- ARG-TC-03: 14.29%
- ARG-TC-04: 14.29%
- ARG-TC-05: 14.29%
- ARG-TC-06: 14.29%
- ARG-TC-07: 14.29%

Cumulative after basis-set execution:
- After 4 tests: 57.14%
- After 7 tests: 100.00%

## Feature D: AR Support Checker
Source: [frontend/utils/checkARSupport.ts](frontend/utils/checkARSupport.ts)
V(G)=10

Path coverage contribution per test case:
- CHK-TC-01: 10.00%
- CHK-TC-02: 10.00%
- CHK-TC-03: 10.00%
- CHK-TC-04: 10.00%
- CHK-TC-05: 10.00%
- CHK-TC-06: 10.00%
- CHK-TC-07: 10.00%
- CHK-TC-08: 10.00%
- CHK-TC-09: 10.00%
- CHK-TC-10: 10.00%

Cumulative after basis-set execution:
- After 5 tests: 50.00%
- After 10 tests: 100.00%

## Feature E: 3D Viewer Screen
Source: [frontend/app/product/model-viewer.tsx](frontend/app/product/model-viewer.tsx)
V(G)=4

Path coverage contribution per test case:
- MV-TC-01: 25.00%
- MV-TC-02: 25.00%
- MV-TC-03: 25.00%
- MV-TC-04: 25.00%

Cumulative after basis-set execution:
- After 2 tests: 50.00%
- After 4 tests: 100.00%

## Feature F: Review Logic
Sources:
- [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx#L230)
- [frontend/store/slices/commentsSlice.ts](frontend/store/slices/commentsSlice.ts)
V(G)=6

Path coverage contribution per test case:
- RV-TC-01: 16.67%
- RV-TC-02: 16.67%
- RV-TC-03: 16.67%
- RV-TC-04: 16.67%
- RV-TC-05: 16.67%
- RV-TC-06: 16.67%

Cumulative after basis-set execution:
- After 3 tests: 50.00%
- After 6 tests: 100.00%

## Overall Basis-Path Coverage Status
If all basis tests in this pack are executed:
- Total designed basis paths covered: 40/40
- Overall basis path coverage: 100%

Note:
- This is basis-path design coverage for white-box planning.
- Instrumented statement/branch/line percentages were not computed from runtime tooling in this material pack.
