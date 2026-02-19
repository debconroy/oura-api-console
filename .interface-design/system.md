# API Console — Design System

## Direction

**Validic-branded diagnostic instrument for API integration.** Light clinical workstation — bright lab, not dark ICU. The interface reflects Validic's brand identity while maintaining the precision of diagnostic tooling.

**Who:** Health-tech developers and testers probing API endpoints during integration work. At their desk, IDE on the adjacent monitor, reading API docs.

**What they do:** Authenticate, select scopes, fire requests at curated endpoints, examine raw response data. The verb: diagnose.

**Feel:** Professional like a modern clinical workstation in daylight. Precise, trustworthy, branded. Validic Dark Blue grounds every screen; Light Blue draws the eye to actions.

## Color System

Validic brand palette adapted for a light environment. Dark Blue anchors text, Light Blue drives interaction.

### Tokens

```
Foundation:
  background:      #F8F9FA    — warm gray field (the light workspace)
  surface:         #FFFFFF    — white cards and panels
  surface-raised:  #F1F3F5    — hover states, raised elements

Borders:
  border:          #E2E5E9    — standard panel separation
  border-subtle:   #EDF0F2    — internal dividers, table rows

Accent (Validic Light Blue):
  accent:          #12C1E6    — primary interactive, CTAs
  accent-hover:    #0FADD0    — button hover (darker)
  accent-active:   #0D9AB8    — button press (darkest)
  accent-light:    #0D9AB8    — text hover darkening
  accent-muted:    #E8F9FC    — subtle selection backgrounds

Text (Validic Dark Blue foundation):
  text-primary:    #1F2958    — headings and key text
  text-secondary:  #4D4D4D    — supporting text
  text-tertiary:   #9CA3AF    — disabled, placeholder

Semantic:
  success:         #3EBE72    — healthy (2xx)
  warning:         #C9A825    — concerning (4xx)
  error:           #DD6754    — critical (5xx)

Method:
  method-get:      #2D9B5A    — observation (reading data)
  method-post:     #7c3aed    — intervention (writing data)
```

## Typography

- **Sans:** Poppins (weights 300-700)
- **Mono:** Geist Mono — URLs, code, status codes
- **Hierarchy:** Size + weight + tracking

## Depth Strategy

Subtle shadows on light surfaces. `shadow-sm` on cards and buttons. Borders for structural separation.

## Spacing

Base unit: 4px. All spacing values are multiples.

## Component Patterns

### Method Badges
`bg-method-get/post min-w-[2.75rem] text-center px-1 py-px rounded text-[10px] font-bold font-mono text-white/90`

### Tab Bar
Active: `border-b-2 border-accent text-accent`
Inactive: `border-transparent text-text-tertiary hover:text-text-secondary`

### Primary Button
`bg-accent hover:bg-accent-hover active:bg-accent-active text-[#1F2958] rounded text-sm font-semibold shadow-sm`

### Inputs
`bg-surface border border-border rounded px-2 py-1.5 text-sm text-text-primary focus:border-accent/50 focus:ring-1 focus:ring-accent/20`

### Cards
`bg-surface border border-border rounded-lg shadow-sm`
