# Function Point Analysis (FPA)
## Feature: Create Product with AR Model Generation

## 1. Counting Boundary

The boundary of this count is the Create Product feature inside the HomeFit seller flow.

Inside the boundary:
- Screen 1: Create Product form (name, description, price, quantity, category, variants, toggles)
- Screen 2: Image picker integration and selected image list
- Screen 3: Submit/Create action and backend product creation processing
- Screen 4: Optional AR model generation flow when generate3D is enabled
- Screen 5: Success/failure response presentation to seller

Outside the boundary (External):
- Hugging Face Image-to-3D service
- Cloudinary media storage service

---

## 2. Data Element Types (DET) - 20 Total

Definition: A DET is a unique, user-recognizable, non-repeated data field.

The following 20 DETs were identified for this feature:

| # | DET Name |
|---|---|
| DET-1 | Product Name |
| DET-2 | Product Description |
| DET-3 | Price |
| DET-4 | Compare Price |
| DET-5 | Cost |
| DET-6 | Quantity |
| DET-7 | Category Selection |
| DET-8 | Is Active Toggle |
| DET-9 | Is Featured Toggle |
| DET-10 | Generate 3D Toggle |
| DET-11 | Size Variant Selection |
| DET-12 | Color Variant Selection |
| DET-13 | Add Image Action |
| DET-14 | Remove Image Action |
| DET-15 | Create Button |
| DET-16 | Uploaded Image |
| DET-17 | Generated GLB URL |
| DET-18 | Generated OBJ URL |
| DET-19 | Success Status |
| DET-20 | Error Message |

Note: Image and model DETs are counted in their related transactions and data functions where user-recognizable.

---

## 3. Record Element Types (RET) - 4 Total

| RET | Sub-Group Name | Fields Included |
|---|---|---|
| RET-1 | Product Core Group | Name, description, price, compare price, cost, quantity, active/featured |
| RET-2 | Category and Variant Group | Category IDs, size options, color options |
| RET-3 | Media Group | Product images list and upload metadata |
| RET-4 | AR Model Group | GLB URL, OBJ URL, generation status |

---

## 4. File Types Referenced (FTR) - Count 4

Definition: FTR counts how many files (ILFs or EIFs) a single transaction reads from or writes to.

The two ILFs and two EIFs identified are:
- FTR-1: Product (ILF)
- FTR-2: Variant (ILF)
- FTR-3: Hugging Face Image-to-3D service contract (EIF)
- FTR-4: Cloudinary media storage contract (EIF)

---

## 5. External Inputs (EI) - Count 13

Definition: An EI is data/control entering from outside the boundary that the application processes and stores.

| # | EI Name | Reasoning |
|---|---|---|
| EI-1 | Product Name Input | Single text field stored in Product ILF |
| EI-2 | Description Input | Single text field stored in Product ILF |
| EI-3 | Price Input | Numeric input stored in Product ILF |
| EI-4 | Compare Price Input | Optional numeric input stored in Product ILF |
| EI-5 | Cost Input | Optional numeric input stored in Product ILF |
| EI-6 | Quantity Input | Integer input stored in Product ILF |
| EI-7 | Category Selection | Category IDs submitted and linked to Product |
| EI-8 | Variant Selection | Size/color selections submitted and stored in Variant ILF |
| EI-9 | Status Toggles | Active and featured values submitted to Product ILF |
| EI-10 | Generate3D Toggle | Control input that triggers optional AR flow |
| EI-11 | Image Upload | Multipart image input written to Product media data |
| EI-12 | Create Product Submit | Composite submit action writing Product plus Variant data |
| EI-13 | Generate AR Model Request | External-call initiating input for model generation and model URL persistence |

---

## 6. External Outputs (EO) - Count 2

Definition: An EO sends derived/processed data outside the boundary.

| # | EO Name | Reasoning |
|---|---|---|
| EO-1 | Product Creation Result | Returns processed result with product data and success/failure state |
| EO-2 | AR Generation Result | Returns generated GLB/OBJ URLs and status after processing |

---

## 7. External Inquiries (EQ) - Count 2

Definition: An EQ is input plus simple retrieval output with no derived calculations and no ILF update.

| # | EQ Name | Reasoning |
|---|---|---|
| EQ-1 | Retrieve Categories for Form | Reads category data for selector display |
| EQ-2 | Retrieve Existing Product Data (edit-compatible lookup) | Reads product and variant values for display without update in inquiry path |

---

## 8. Internal Logical Files (ILF) - Count 2

Definition: An ILF is logically related data maintained within the boundary.

| # | ILF Name | Reasoning |
|---|---|---|
| ILF-1 | Product | Maintained by HomeFit and updated by create product transactions |
| ILF-2 | Variant | Maintained by HomeFit and updated with product variant selections |

---

## 9. External Interface Files (EIF) - Count 2

Definition: An EIF is maintained by another system but referenced by this feature.

| # | EIF Name | Reasoning |
|---|---|---|
| EIF-1 | Hugging Face Image-to-3D | External service owns and returns model generation data |
| EIF-2 | Cloudinary Media Service | External service owns stored media metadata and URLs |

---

## 10. Complexity and Weighting Summary

### 10.1 Data Function Complexity

| Function | Type | DET | RET | Complexity | Weight | FP |
|---|---|---:|---:|---|---:|---:|
| Product | ILF | 16 | 3 | Low | 7 | 7 |
| Variant | ILF | 6 | 1 | Low | 7 | 7 |
| Hugging Face Contract | EIF | 4 | 1 | Low | 5 | 5 |
| Cloudinary Contract | EIF | 4 | 1 | Low | 5 | 5 |

Data FP subtotal = 24

### 10.2 Transaction Function Complexity

| Function Group | Count | Complexity Mix | Weighting | FP |
|---|---:|---|---|---:|
| EI | 13 | 10 Low + 3 Average | (10 x 3) + (3 x 4) | 42 |
| EO | 2 | 1 Average + 1 High | (1 x 5) + (1 x 7) | 12 |
| EQ | 2 | 2 Low | 2 x 3 | 6 |

Transaction FP subtotal = 60

### 10.3 Unadjusted Function Point (UFP)

UFP = Data FP + Transaction FP = 24 + 60 = 84

---

## 11. Value Adjustment and Final FP

Using the same feature context assumptions:
- Total Degree of Influence (TDI) = 41
- Value Adjustment Factor (VAF) = 0.65 + (0.01 x 41) = 1.06

Adjusted Function Points:

AFP = UFP x VAF = 84 x 1.06 = 89.04

Rounded AFP = 89

---

## 12. Final Result

| Metric | Value |
|---|---:|
| ILF Count | 2 |
| EIF Count | 2 |
| EI Count | 13 |
| EO Count | 2 |
| EQ Count | 2 |
| UFP | 84 |
| VAF | 1.06 |
| AFP (Rounded) | 89 |

---

## 13. Notes

1. This version follows the detailed action-level counting format you shared (separate user actions represented as separate EIs).
2. If your evaluator prefers stricter elementary-process aggregation, EI count can be consolidated, resulting in lower UFP/AFP.
3. The document is formatted so you can reuse the same template style for other features.
