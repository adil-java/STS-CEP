# LIP White-Box Test Case Tables

## Technique
Linear Independent Path (Basis Path Testing).
Each test case is designed to execute at least one unique independent path.

---

## Feature 1: Product View + Attributes + Cart/Buy
Target unit: `ProductDetailScreen` in [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx)
Approximate cyclomatic complexity for tested flow subset: V(G) = 8
Independent paths: PV-IP1 to PV-IP8

| TC ID | Independent Path | Test Data / Preconditions | Steps | Expected Output |
|---|---|---|---|---|
| PV-TC-01 | PV-IP1 (product missing) | Route id not present in store | Open product detail route with unknown id | "Product not found" screen shown |
| PV-TC-02 | PV-IP2 (wishlist add) | Product exists, not in wishlist | Tap wishlist icon once | Item added to wishlist and success toast shown |
| PV-TC-03 | PV-IP3 (wishlist remove) | Product exists, already in wishlist | Tap wishlist icon once | Item removed and info toast shown |
| PV-TC-04 | PV-IP4 (add-to-cart missing variant) | Product has required variants, one not selected | Tap Add to Cart | "Selection required" toast; no dispatch to cart |
| PV-TC-05 | PV-IP5 (add-to-cart out of stock) | Product quantity = 0, all variants selected | Tap Add to Cart | "Out of stock" toast; no dispatch |
| PV-TC-06 | PV-IP6 (add-to-cart success) | quantity > 0, variants selected, addToCart resolves | Tap Add to Cart | success toast and item added in cart state |
| PV-TC-07 | PV-IP7 (add-to-cart thunk failure) | quantity > 0, variants selected, addToCart rejects | Tap Add to Cart | error toast "Could not add to cart" |
| PV-TC-08 | PV-IP8 (buy-now guard when already processing) | isBuyingNow = true | Tap Buy Now | No duplicate action, no additional dispatch |
| PV-TC-09 | PV-IP9 (buy-now missing variant) | isBuyingNow = false, missing variant | Tap Buy Now | "Selection required" toast |
| PV-TC-10 | PV-IP10 (buy-now out of stock) | isBuyingNow = false, qty <= 0 | Tap Buy Now | "Out of stock" toast |
| PV-TC-11 | PV-IP11 (buy-now success path) | valid selections, addToCart resolves | Tap Buy Now | Item added and route push to `/checkout` |
| PV-TC-12 | PV-IP12 (buy-now failure path) | valid selections, addToCart rejects | Tap Buy Now | `isBuyingNow` reset false and error toast |
| PV-TC-13 | PV-IP13 (quantity increment allowed) | stockQty=5, quantity=1 | Tap + | quantity becomes 2 |
| PV-TC-14 | PV-IP14 (quantity blocked at max) | stockQty=2, quantity=2 | Tap + | quantity unchanged and max toast shown |

---

## Feature 2: AR Preview Entry + Routing
Target unit: `ARPreviewButton` in [frontend/components/ARPreviewButton.tsx](frontend/components/ARPreviewButton.tsx)
Cyclomatic complexity: V(G) = 5
Independent paths: ARB-IP1 to ARB-IP5

| TC ID | Independent Path | Test Data / Preconditions | Steps | Expected Output |
|---|---|---|---|---|
| ARB-TC-01 | ARB-IP1 (empty model URL) | modelUrl = "" | Tap Preview in 3D | Alert "3D Preview Not Available" |
| ARB-TC-02 | ARB-IP2 (Expo Go fallback) | modelUrl valid, Constants.appOwnership="expo" | Tap Preview in 3D | Info toast, route push to `/product/model-viewer?...` |
| ARB-TC-03 | ARB-IP3 (web unsupported) | modelUrl valid, non-expo, Platform.OS="web" | Tap Preview in 3D | Alert "AR Not Supported", no AR route push |
| ARB-TC-04 | ARB-IP4 (normal AR route) | modelUrl valid, native build, Platform mobile | Tap Preview in 3D | route push to `/product/ar?...` |
| ARB-TC-05 | ARB-IP5 (exception fallback) | Force `router.push` throw | Tap Preview in 3D | Error toast and fallback push to model-viewer |

---

## Feature 3: AR Route Capability Gating
Target unit: `ProductARScreen` in [frontend/app/product/ar.tsx](frontend/app/product/ar.tsx)
Cyclomatic complexity (loadAR flow): V(G) = 7
Independent paths: ARG-IP1 to ARG-IP7

| TC ID | Independent Path | Test Data / Preconditions | Steps | Expected Output |
|---|---|---|---|---|
| ARG-TC-01 | ARG-IP1 (missing model) | query modelUrl empty | Open `/product/ar` | redirect to model-viewer with toast |
| ARG-TC-02 | ARG-IP2 (web fallback) | modelUrl valid, Platform web | Open `/product/ar?...` | redirect to model-viewer, web fallback toast |
| ARG-TC-03 | ARG-IP3 (Expo Go fallback) | modelUrl valid, appOwnership expo | Open route | redirect to model-viewer, Expo message |
| ARG-TC-04 | ARG-IP4 (unsupported device) | modelUrl valid, checkARSupport returns false | Open route | redirect to model-viewer, unsupported message |
| ARG-TC-05 | ARG-IP5 (supported + mounted true) | checkARSupport true | Open route | Native AR screen component rendered |
| ARG-TC-06 | ARG-IP6 (exception path) | throw from `checkARSupport` or `require('./ar-native')` | Open route | catch path, redirect to model-viewer |
| ARG-TC-07 | ARG-IP7 (unmounted before finally) | trigger unmount before async completion | Open then navigate back quickly | no state update warnings; final guard respected |

---

## Feature 4: AR Support Detector (Strict/Non-Strict)
Target unit: `checkARSupport` in [frontend/utils/checkARSupport.ts](frontend/utils/checkARSupport.ts)
Cyclomatic complexity: V(G) = 10
Independent paths: CHK-IP1 to CHK-IP10

| TC ID | Independent Path | Test Data / Preconditions | Steps | Expected Output |
|---|---|---|---|---|
| CHK-TC-01 | CHK-IP1 (cached return) | cachedResult = true | Call checkARSupport() | returns true immediately |
| CHK-TC-02 | CHK-IP2 (web) | cached null, Platform web | Call checkARSupport() | returns false, cache false |
| CHK-TC-03 | CHK-IP3 (expo ownership) | Platform native, appOwnership expo | Call checkARSupport() | returns false |
| CHK-TC-04 | CHK-IP4 (ios) | Platform iOS, non-expo | Call checkARSupport() | returns true |
| CHK-TC-05 | CHK-IP5 (android no module) | Platform Android, import fails | Call checkARSupport() | returns false |
| CHK-TC-06 | CHK-IP6 (android missing navigator) | viro exists, navigator missing | Call checkARSupport() | returns false |
| CHK-TC-07 | CHK-IP7 (runtime API true/false) | runtime fn exists | Call checkARSupport() | returns boolean(runtime result) |
| CHK-TC-08 | CHK-IP8 (strict true without runtime API) | runtime fn absent, strict=true | Call checkARSupport({strict:true}) | returns false |
| CHK-TC-09 | CHK-IP9 (non-strict without runtime API) | runtime fn absent, strict=false | Call checkARSupport({strict:false}) | returns true |
| CHK-TC-10 | CHK-IP10 (outer catch) | force unexpected exception | Call checkARSupport() | returns false |

---

## Feature 5: 3D Viewer Fallback Screen
Target unit: `ModelViewerScreen` in [frontend/app/product/model-viewer.tsx](frontend/app/product/model-viewer.tsx)
Cyclomatic complexity: V(G) = 4
Independent paths: MV-IP1 to MV-IP4

| TC ID | Independent Path | Test Data / Preconditions | Steps | Expected Output |
|---|---|---|---|---|
| MV-TC-01 | MV-IP1 (missing model URL) | modelUrl empty | Open `/product/model-viewer` | "No 3D Model Available" screen |
| MV-TC-02 | MV-IP2 (webview error) | valid modelUrl, trigger `onError` | Open route and force load error | error UI with Try Again button |
| MV-TC-03 | MV-IP3 (normal viewer path with banner) | valid modelUrl, no webview errors | Open route | WebView shown and info banner visible |
| MV-TC-04 | MV-IP4 (banner dismissed) | route already loaded | Tap close icon in banner | banner hidden, viewer remains active |

---

