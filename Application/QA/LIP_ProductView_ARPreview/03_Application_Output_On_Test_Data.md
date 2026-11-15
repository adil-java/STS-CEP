# Application Output on Test Data

## Notes
This file captures expected runtime outputs based on source-level white-box path tracing for LIP test inputs.

## Feature A: Product View + Attributes

### PV-TC-01 (Missing product)
Input:
- Route: `/product/UNKNOWN_ID`

Expected app output:
- Screen text: `Product not found`
- No Add to Cart / Buy Now actions available

### PV-TC-04 (Missing required variant)
Input:
- Product has variant `Size`, no size selected
- Tap Add to Cart

Expected app output:
- Toast type: info
- Toast text1: `Selection required`
- Toast text2: `Please select Size`

### PV-TC-05 (Out of stock)
Input:
- Product quantity = 0
- Required attributes selected
- Tap Add to Cart

Expected app output:
- Toast type: error
- Toast text1: `Out of stock`
- Toast text2: `This product is currently unavailable.`

### PV-TC-06 (Add to cart success)
Input:
- quantity = 2
- Required attributes selected
- addToCart resolves

Expected app output:
- Toast type: success
- Toast text1: `Added to cart`
- Toast text2: `2 items added`
- Cart state updated with selected options

### PV-TC-11 (Buy now success)
Input:
- Valid product, in stock, attributes selected
- addToCart resolves

Expected app output:
- Route navigation to `/checkout`
- Buy button shows `Processing...` until action resolves

### PV-TC-14 (Quantity max reached)
Input:
- stockQty = 2, current quantity = 2
- Tap plus button

Expected app output:
- Quantity unchanged at 2
- Toast type: info
- Toast text1: `Maximum quantity reached`
- Toast text2: `Only 2 items available in stock`

## Feature B: AR Preview Button

### ARB-TC-01 (No model URL)
Input:
- modelUrl = empty
- Tap `Preview in 3D`

Expected app output:
- Alert title: `3D Preview Not Available`
- Alert message: `This product doesn't have a 3D model yet.`

### ARB-TC-02 (Expo Go)
Input:
- modelUrl valid
- Constants.appOwnership = `expo`

Expected app output:
- Toast type: info
- Toast text1: `AR Preview Unavailable`
- Route push: `/product/model-viewer?modelUrl=...`

### ARB-TC-04 (Native AR route)
Input:
- modelUrl valid, not web, not expo

Expected app output:
- Route push: `/product/ar?modelUrl=...`

### ARB-TC-05 (Exception fallback)
Input:
- Inject failure inside try path

Expected app output:
- Toast type: error
- Toast text1: `AR Preview Unavailable`
- Toast text2: `Opening 3D viewer instead.`
- Route push to model-viewer fallback

## Feature C: AR Route Gating

### ARG-TC-01 (Missing model URL)
Expected output:
- Toast info: `3D model not found for this product.`
- Route replace to `/product/model-viewer?modelUrl=`

### ARG-TC-04 (Unsupported AR)
Expected output:
- Toast info: `This device does not support ARCore/ARKit.`
- Route replace to model-viewer

### ARG-TC-05 (Supported AR)
Expected output:
- Native AR component loaded via `require('./ar-native')`
- AR preparation screen removed

### ARG-TC-06 (Load exception)
Expected output:
- Console: `[AR] Failed to load native AR screen:`
- Toast info: `Opening 3D viewer instead.`
- Route replace to model-viewer

## Feature D: Model Viewer

### MV-TC-01 (Missing URL)
Expected output:
- Title: `No 3D Model Available`
- Button: `Go Back`

### MV-TC-02 (WebView error)
Expected output:
- Title: `Unable to Load 3D Viewer`
- Button: `Try Again`
- `setWebViewError(false)` on retry tap

### MV-TC-03 (Normal render)
Expected output:
- Header: `3D Preview`
- Info banner visible
- WebView loads generated HTML model-viewer payload

## Feature E: Review

### RV-TC-01 (Empty review blocked)
Input:
- `newComment = "   "`
- Tap `Submit Review`

Expected output:
- Toast type: error
- Toast text2: `Please enter a comment`
- No dispatch to add comment

### RV-TC-02 (Add review)
Input:
- `newComment = "Good quality"`, rating = 4

Expected output:
- Comment added at top of review list
- Toast type: success
- Form reset: empty text, rating reset to 5, form hidden

### RV-TC-03 (Delete review)
Input:
- Tap Delete on existing comment

Expected output:
- Comment removed from state/list
- Toast text1: `Comment deleted`
