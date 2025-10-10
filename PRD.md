# HUMBUG! - Quiz Party Game Landing Page

A captivating landing page for an experimental offline quiz party game that combines strategy, bluffing, and trivia knowledge.

**Experience Qualities**: 
1. Dramatic - Creates the tension and excitement of a high-stakes quiz show
2. Sophisticated - Appeals to adults who enjoy intellectual party games  
3. Engaging - Interactive elements and animations keep visitors exploring

**Complexity Level**: Content Showcase (information-focused)
- Primary purpose is to explain game rules and showcase sample questions through an engaging presentation

## Essential Features

**Hero Section**
- Functionality: Eye-catching title display with game tagline
- Purpose: Immediate brand recognition and game concept communication
- Trigger: Page load
- Progression: Animated title appearance → tagline reveal → call-to-action emergence
- Success criteria: Visitors understand this is a quiz game within 3 seconds

**Game Rules Section**
- Functionality: Clear explanation of HUMBUG gameplay mechanics with embedded MP3 audio
- Purpose: Educate potential players on how to play
- Trigger: Scroll or navigation click
- Progression: Text reveal → audio player display → visual examples
- Success criteria: Rules are comprehensible without additional explanation needed

**Sample Questions Cards**
- Functionality: Interactive animated cards displaying example quiz questions and answers
- Purpose: Demonstrate game content quality and variety
- Trigger: Scroll into view or card interaction
- Progression: Card flip animation → question display → answer reveal on hover/click
- Success criteria: Visitors can browse through at least 6 different sample questions

**Visual Theme Integration**
- Functionality: Consistent "Who Wants to be a Millionaire" inspired design
- Purpose: Create familiar yet unique game show atmosphere
- Trigger: Throughout entire experience
- Progression: Consistent visual language across all sections
- Success criteria: Design feels cohesive and professional like a TV game show

## Edge Case Handling
- **Audio Loading**: Fallback text if MP3 fails to load
- **Mobile Responsiveness**: Cards and animations adapt gracefully to smaller screens
- **Slow Connections**: Progressive loading with skeleton states
- **Accessibility**: Keyboard navigation for all interactive elements
- **Browser Compatibility**: Graceful degradation for older browsers

## Design Direction
The design should evoke the sophisticated drama of prime-time quiz shows while maintaining a modern, approachable feel for party game enthusiasts.

## Color Selection
Triadic (three equally spaced colors) - Using deep blues, golden yellows, and rich purples to create the classic game show atmosphere with luxurious feel.

- **Primary Color**: Deep Navy (oklch(0.15 0.1 240)) - Authority and intelligence
- **Secondary Colors**: Rich Gold (oklch(0.75 0.15 85)) for highlights and success states, Deep Purple (oklch(0.35 0.12 280)) for accents
- **Accent Color**: Bright Gold (oklch(0.85 0.18 90)) - High-energy call-to-action and focus elements
- **Foreground/Background Pairings**: 
  - Background Navy (oklch(0.15 0.1 240)): White text (oklch(0.98 0 0)) - Ratio 15.2:1 ✓
  - Card Gold (oklch(0.75 0.15 85)): Dark Navy text (oklch(0.15 0.1 240)) - Ratio 12.8:1 ✓
  - Accent Bright Gold (oklch(0.85 0.18 90)): Dark Navy text (oklch(0.15 0.1 240)) - Ratio 8.9:1 ✓

## Font Selection
Typography should convey authority and excitement, similar to television quiz shows, using bold, highly legible fonts that work well in both large display sizes and body text.

- **Typographic Hierarchy**: 
  - H1 (Game Title): Inter Black/48px/tight letter spacing (-0.02em)
  - H2 (Section Headers): Inter Bold/32px/normal spacing
  - H3 (Card Titles): Inter SemiBold/24px/normal spacing  
  - Body Text: Inter Regular/16px/relaxed line height (1.6)
  - Buttons: Inter Medium/18px/uppercase transform

## Animations
Animations should feel dramatic and purposeful, reminiscent of game show reveals and transitions, with smooth easing that builds anticipation.

- **Purposeful Meaning**: Motion reinforces the excitement and drama of quiz show reveals
- **Hierarchy of Movement**: Title animations are most prominent, followed by card reveals, then subtle hover states

## Component Selection
- **Components**: 
  - Cards for question display with flip animations
  - Buttons with hover states for navigation
  - Audio component for embedded MP3
  - Scroll-triggered animations using framer-motion
- **Customizations**: 
  - Custom card flip animations
  - Game show inspired button styling with gradients
  - Audio player with custom controls
- **States**: 
  - Cards: default → hover → flipped
  - Buttons: rest → hover → active with scale and glow effects
- **Icon Selection**: Play/pause for audio, arrow icons for navigation, question mark for quiz elements
- **Spacing**: Generous use of space with 24px base grid system
- **Mobile**: Cards stack vertically, audio player adapts, touch-friendly button sizes (44px minimum)