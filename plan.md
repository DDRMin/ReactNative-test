# Plan: Liquid Glass Sliding Navbar

## Objective
Enhance the existing `GlassmorphicTabBar` component to feature a realistic "liquid glass" aesthetic. This involves improving the visual depth, transparency, and animation physics of the sliding active indicator to resemble a fluid, glossy glass element.

## Prerequisites
- [x] Project initialized
- [x] `expo-blur` installed
- [x] `react-native-reanimated` installed
- [x] `expo-linear-gradient` installed (Verified in `package.json`)

## Design Specification

### 1. Visual Style (Liquid Glass)
- **Container (Bar):**
  - High blur intensity (Frosted glass).
  - Subtle white border (1px, low opacity) to define edges.
  - Deep semi-transparent background.
- **Active Indicator (The "Liquid Button"):**
  - **Gradient Overlay:** Use `LinearGradient` to create a "shine" or reflection effect (diagonal white-to-transparent).
  - **Transparency:** Retain translucency to show the blurred background behind it.
  - **Shape:** Rounded corners (pill shape) to mimic surface tension.
  - **Shadow:** Soft shadow to lift the droplet/glass pane off the bar.

### 2. Animation (Fluid Physics)
- **Motion:** Use `spring` animation with lower stiffness and higher damping to simulate viscosity (liquid movement) rather than a snappy mechanical slide.

## Implementation Steps

### Step 1: Component Update (`components/GlassmorphicTabBar.tsx`)
- Import `LinearGradient` from `expo-linear-gradient`.
- Update the **Indicator View**:
  - Replace the simple background view with a `LinearGradient` to simulate light reflection.
  - Add `shadow` properties (elevation/shadowColor) for depth.
- Update the **Container View**:
  - Add `borderColor: 'rgba(255,255,255,0.2)'` and `borderWidth: 1` to the main blur container for a crisp glass edge.

### Step 2: Animation Tuning
- Modify the `withSpring` configuration in `useSharedValue`:
  - **Damping:** Increase slightly to prevent excessive oscillation (make it feel "heavy" like liquid).
  - **Stiffness:** Adjust to control the speed of the flow.

### Step 3: Icon Contrast
- Ensure active icons are clearly visible (e.g., solid dark or vibrant color) against the glass indicator.
- Ensure inactive icons are subtle (semi-transparent white).

## Verification
- Run the app on iOS/Android (Simulators).
- Navigate between tabs to observe:
  - The "glossy" reflection on the moving indicator.
  - The fluid, viscous movement of the slide.
  - Visual clarity of icons.
