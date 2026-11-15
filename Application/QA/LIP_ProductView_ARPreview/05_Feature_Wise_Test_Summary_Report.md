# Feature-Wise Test Summary Report (LIP)

## Project
HomeFit

## Test Objective
White-box test design for Product View and AR Preview feature set using Linear Independent Path (LIP) method.

## Features Covered
1. Product view loading and guard flows
2. Attribute/variant selection validation
3. Cart and Buy Now decision paths
4. AR preview entry and fallback routing
5. AR capability gating and device handling
6. 3D viewer fallback screen handling
7. Review/comment add-delete logic

## Test Artifacts Included
- Source code printouts: [QA/LIP_ProductView_ARPreview/01_Source_Code_Printouts.md](QA/LIP_ProductView_ARPreview/01_Source_Code_Printouts.md)
- Test case tables: [QA/LIP_ProductView_ARPreview/02_Test_Case_Tables_LIP.md](QA/LIP_ProductView_ARPreview/02_Test_Case_Tables_LIP.md)
- Application output on test data: [QA/LIP_ProductView_ARPreview/03_Application_Output_On_Test_Data.md](QA/LIP_ProductView_ARPreview/03_Application_Output_On_Test_Data.md)
- Coverage calculations: [QA/LIP_ProductView_ARPreview/04_Code_Coverage_Calculations.md](QA/LIP_ProductView_ARPreview/04_Code_Coverage_Calculations.md)

## Feature-Wise Summary

| Feature | Basis Paths V(G) | Designed LIP Tests | Basis Coverage Target |
|---|---:|---:|---:|
| Product View + Attributes + Cart/Buy | 8 | 14 (8 minimum basis + 6 robustness) | 100% |
| AR Preview Button Routing | 5 | 5 | 100% |
| AR Route Capability Gating | 7 | 7 | 100% |
| AR Support Checker | 10 | 10 | 100% |
| 3D Viewer Fallback Screen | 4 | 4 | 100% |
| Review Add/Delete + reducer branches | 6 | 6 | 100% |
| Total | 40 | 46 | 100% basis path coverage |

## Execution Status
Design-ready status:
- Test design completion: 100%
- Basis path identification: 100%
- Coverage calculation completion: 100%
- Runtime execution status: Not executed in this document pack

## Defect Risk Areas (from white-box inspection)
1. Duplicate order submission risk if Buy Now loading state is not reset on all asynchronous edge cases.
2. AR fallback reliability depends on strict handling in [frontend/app/product/ar.tsx](frontend/app/product/ar.tsx).
3. Review flow currently uses local mock state and can diverge from backend review entities.
4. Dynamic route registration order in backend product routes may cause ambiguous behavior (`/:id` before `/featured` and `/search`) in some setups.

## Comparison: LIP vs Other White-Box Techniques

### 1) LIP (Basis Path Testing)
- Focus: execute all linearly independent control-flow paths.
- Strength: guarantees each decision structure is traversed with minimal mathematically justified tests.
- Best for: branch-heavy feature logic with many fallbacks (exactly this AR + product flow).

### 2) Statement Coverage
- Focus: ensure each statement executes at least once.
- Limitation: can miss decision outcomes; both true/false sides may not run.
- In this project: statement coverage alone may miss fallback routes and error paths.

### 3) Branch/Decision Coverage
- Focus: execute each branch outcome true/false.
- Strength: better than statement coverage for conditionals.
- Limitation: does not guarantee unique path combinations across sequential decisions.
- In this project: may still miss meaningful combinations like `valid model + supported device + native load failure`.

### 4) Condition Coverage
- Focus: each atomic boolean in compound conditions takes true and false.
- Strength: deeper predicate validation.
- Limitation: may still not exercise full end-to-end paths through side effects and navigation flows.

### 5) MC/DC
- Focus: each condition independently affects decision outcome.
- Strength: very rigorous for safety-critical systems.
- Limitation: high test volume and cost compared to this product domain.

## Why LIP Was Selected
1. AR Preview and Product View involve multiple early exits, fallbacks, and exception routes.
2. LIP gives minimal yet complete path set using V(G), which fits academic white-box reporting requirements.
3. It balances rigor and practicality better than MC/DC for a consumer app feature.
4. It directly supports feature-wise summary, path IDs, and coverage-by-test-case reporting.

## Conclusion
The LIP-based white-box test design for Product View + AR Preview is complete and submission-ready.
If all basis tests are executed, the designed basis path coverage reaches 100% across all selected feature units.
