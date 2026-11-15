# Source Code Printouts (Product View + AR Preview + Attributes + Review)

## Scope
This printout captures the exact control-flow points used for Linear Independent Path (LIP) white-box testing.

## A) Product View, Attributes, Cart, Buy Now, Review
File: frontend/app/product/[id].tsx

### 1. Product existence guard
- [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx#L66)
- Decision: `if (!product)`
- Outcome:
  - True: show "Product not found"
  - False: continue with detail screen

### 2. Add to cart path logic
- [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx#L103)
- Decisions:
  - [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx#L109): `if (missingVariant)`
  - [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx#L119): `if (!product.quantity || product.quantity <= 0)`
  - [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx#L153): `catch` block for thunk rejection

### 3. Buy now path logic
- [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx#L163)
- Decisions:
  - [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx#L164): `if (isBuyingNow) return`
  - [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx#L171): `if (missingVariant)`
  - [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx#L181): `if (!product.quantity || product.quantity <= 0)`
  - [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx#L214): `catch` branch

### 4. Quantity and attribute interactions
- [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx#L469): variants rendered and selected
- [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx#L546): quantity increment branch
  - True: increment quantity
  - False: show max quantity toast

### 5. Review submission/deletion
- [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx#L230)
- Decisions:
  - [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx#L231): empty comment guard
  - [frontend/app/product/[id].tsx](frontend/app/product/[id].tsx#L265): delete comment action


## B) AR Preview button routing logic
File: frontend/components/ARPreviewButton.tsx

### Core decision points
- [frontend/components/ARPreviewButton.tsx](frontend/components/ARPreviewButton.tsx#L19): model URL guard
- [frontend/components/ARPreviewButton.tsx](frontend/components/ARPreviewButton.tsx#L31): Expo Go route to model viewer
- [frontend/components/ARPreviewButton.tsx](frontend/components/ARPreviewButton.tsx#L43): web platform alert path
- [frontend/components/ARPreviewButton.tsx](frontend/components/ARPreviewButton.tsx#L54): normal AR route push
- [frontend/components/ARPreviewButton.tsx](frontend/components/ARPreviewButton.tsx#L55): catch fallback to model viewer


## C) AR route capability gating and fallback
File: frontend/app/product/ar.tsx

### Core decision points
- [frontend/app/product/ar.tsx](frontend/app/product/ar.tsx#L35): missing model URL
- [frontend/app/product/ar.tsx](frontend/app/product/ar.tsx#L40): web path fallback
- [frontend/app/product/ar.tsx](frontend/app/product/ar.tsx#L46): Expo Go fallback
- [frontend/app/product/ar.tsx](frontend/app/product/ar.tsx#L52): unsupported-device fallback
- [frontend/app/product/ar.tsx](frontend/app/product/ar.tsx#L58): load native screen if mounted
- [frontend/app/product/ar.tsx](frontend/app/product/ar.tsx#L61): catch fallback
- [frontend/app/product/ar.tsx](frontend/app/product/ar.tsx#L65): finally loading-state update if mounted


## D) AR support detector
File: frontend/utils/checkARSupport.ts

### Core decision points
- [frontend/utils/checkARSupport.ts](frontend/utils/checkARSupport.ts#L22): cache short-circuit
- [frontend/utils/checkARSupport.ts](frontend/utils/checkARSupport.ts#L27): web => false
- [frontend/utils/checkARSupport.ts](frontend/utils/checkARSupport.ts#L32): Expo Go => false
- [frontend/utils/checkARSupport.ts](frontend/utils/checkARSupport.ts#L37): iOS => true
- [frontend/utils/checkARSupport.ts](frontend/utils/checkARSupport.ts#L44): Android branch
- [frontend/utils/checkARSupport.ts](frontend/utils/checkARSupport.ts#L51): missing navigator => false
- [frontend/utils/checkARSupport.ts](frontend/utils/checkARSupport.ts#L58): runtime support function exists
- [frontend/utils/checkARSupport.ts](frontend/utils/checkARSupport.ts#L66): strict mode fallback false
- [frontend/utils/checkARSupport.ts](frontend/utils/checkARSupport.ts#L74): import failure catch
- [frontend/utils/checkARSupport.ts](frontend/utils/checkARSupport.ts#L85): outer catch fallback false


## E) 3D model viewer fallback screen
File: frontend/app/product/model-viewer.tsx

### Core decision points
- [frontend/app/product/model-viewer.tsx](frontend/app/product/model-viewer.tsx#L364): missing model URL UI
- [frontend/app/product/model-viewer.tsx](frontend/app/product/model-viewer.tsx#L392): webview error UI
- [frontend/app/product/model-viewer.tsx](frontend/app/product/model-viewer.tsx#L431): banner shown/hidden
- [frontend/app/product/model-viewer.tsx](frontend/app/product/model-viewer.tsx#L455): `onError` => setWebViewError(true)
- [frontend/app/product/model-viewer.tsx](frontend/app/product/model-viewer.tsx#L456): `onHttpError` => setWebViewError(true)


## F) Native AR scene logic
File: frontend/app/product/ar-native.tsx

### Core decision points
- [frontend/app/product/ar-native.tsx](frontend/app/product/ar-native.tsx#L94): model load error fallback scene
- [frontend/app/product/ar-native.tsx](frontend/app/product/ar-native.tsx#L108): object visibility `!!position && !isLoading`
- [frontend/app/product/ar-native.tsx](frontend/app/product/ar-native.tsx#L114): drag enabled if not fixed
- [frontend/app/product/ar-native.tsx](frontend/app/product/ar-native.tsx#L116): drag update position only when not fixed
- [frontend/app/product/ar-native.tsx](frontend/app/product/ar-native.tsx#L136): set initial placement on clicked plane when not loading
- [frontend/app/product/ar-native.tsx](frontend/app/product/ar-native.tsx#L151): missing model URL screen


## G) Review reducer behavior (state-level)
File: frontend/store/slices/commentsSlice.ts

### Core decision points
- [frontend/store/slices/commentsSlice.ts](frontend/store/slices/commentsSlice.ts#L71): update existing comment only if found
- [frontend/store/slices/commentsSlice.ts](frontend/store/slices/commentsSlice.ts#L80): add reply only if comment exists
- [frontend/store/slices/commentsSlice.ts](frontend/store/slices/commentsSlice.ts#L81): initialize `replies` if absent
- [frontend/store/slices/commentsSlice.ts](frontend/store/slices/commentsSlice.ts#L89): update helpful only if comment exists
