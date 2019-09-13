# Scaling fonts in your application

Problem:
You need to support users with a visual impairment that requires larger fonts.

`@nota/nativescript-accessibility-ext` extends the nativescript theme (requires `nativescript-theme-core@^2.0.19`) to provide support for font-scaling on `iOS`.
Support is built-in on `android` but you might need to handle the layout changes.

## Installing the theme extension:

You need to add a single line to your  `app.scss` / `app.css`:

```scss
@import '~nativescript-theme-core/core.css';
@import '~nativescript-theme-core/css/grey.css';
@import '~@nota/nativescript-accessibility-ext/a11y.css'; // <-- add this line
```

For compat mode:
```scss
@import '~nativescript-theme-core/core.compat.css';
@import '~nativescript-theme-core/css/grey.compat.css';
@import '~@nota/nativescript-accessibility-ext/a11y.compat.css'; // <-- add this line
```

If you use the theme-classes font-scaling will be enabled on both platforms.

## Writing your own font-scale styles:

### using css-variables and css-calc:

| variable | description |
| -- | -- |
| --a11y-fontscale-factor | This is the current scaling factor, defaults to 1 |
| --a11y-font-size | Default font-size, scaled version of --const-font-size |
| --a11y-btn-font-size | Button font-size, scaled version of --const-btn-font-size |
| --a11y-icon-font-size-lg | Icon font-size, scaled version of --const-icon-font-size-lg |
| --a11y-drawer-header-font-size | Sidebar header font-size |
| --const-segmented-bar-font-size | Base font size used by the segmented bar |
| --const-segmented-bar-height | Base height of the segmented bar |
| --a11y-segmented-bar-font-size | SegmentedBar font-size, scaled version of --const-segmented-bar-font-size |
| --a11y-segmented-bar-height | SegmentedBar height, scaled version of  --const-segmented-bar-height |
| --const-drawer-header-font-size | Base SideDrawer header font-size |
| --a11y-drawer-header-font-size |  SideDrawer header font-size, scaled version of --const-drawer-header-font-size |
| --a11y-{text-classname}-size | Scaled font-size variable for the text CSS-classes `t-10`...`t-36`, `h1`...`h6`, `body`, `body2` and `footnote`. |

```scss
.my-class {
  height: calc(40 * var(--a11y-fontscale-factor));
  margin: calc(2 * var(--a11y-fontscale-factor));
  font-size: calc(16 * var(--a11y-fontscale-factor));
}
```

# Using the font-scale classes (deprecated)

This is the old way of using font-scaling. It is deprecated and will be removed soon.

A CSS-class matching the current font-scale setting is added to each view
- a11y-fontscale-50 (iOS only - extra small font size)
- a11y-fontscale-70 (iOS only - extra small font size)
- a11y-fontscale-85
- a11y-fontscale-100
- a11y-fontscale-115
- a11y-fontscale-130
- a11y-fontscale-150 (iOS only)
- a11y-fontscale-200 (iOS only - extra large font size)
- a11y-fontscale-250 (iOS only - extra large font size)
- a11y-fontscale-300 (iOS only - extra large font size)
- a11y-fontscale-350 (iOS only - extra large font size)
- a11y-fontscale-400 (iOS only - extra large font size)

To use these you need to generate

```scss
@import '~@nota/nativescript-accessibility-ext/scss/fontscales';

$my-custom-font-size: 16;
$my-custom-height: 40;
$my-custom-margin: 2;
.my-class {
  height: $my-custom-height;
  margin: $my-custom-margin;
  font-size: $my-custom-font-size;

  @each $scaleName, $params in $a11y-font-scales {
    $factor: map-get($params, factor); // scaling factor 0.8, 1.0., 1.3 etc
    $extraSmall: map-get($params, extraSmall); // extra small font size
    $extraLarge: map-get($params, extraLarge); // extra large font size
    &.a11y-fontscale-#{$scaleName} {
      height: $my-custom-height * $factor;
    }
  }
}
```
