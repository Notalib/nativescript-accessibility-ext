# Scaling fonts in your application

Problem:
You need to support users with a visual impairment that requires larger fonts.

`@nota/nativescript-accessibility-ext` extends the nativescript theme (requires `nativescript-theme-core@^2.0.19`) to provide support for font-scaling on `iOS`.
Support is built-in on `android` but you might need to handle the layout changes.

## Installing the theme extension:

You need to add a single line to your `app.scss`:

```scss
@import '~@nativescript/theme/core.compat';
@import '~@nativescript/theme/scss/index';
@import url('~@nota/nativescript-accessibility-ext/a11y.css'); // <-- add this line
```

For compat mode:

```scss
@import '~@nativescript/theme/core.compat';
@import '~@nativescript/theme/scss/index';
@import url('~@nota/nativescript-accessibility-ext/a11y.compat.css'); // <-- add this line
```

If you use the theme-classes font-scaling will be enabled on both platforms.

## Writing your own font-scale styles:

You can write your own font-scale styles using `css-variables` and `css-calc`.

| variable                        | description                                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| --a11y-fontscale-factor         | Current fontscale factor                                                                                         |
| --a11y-font-size                | Default font-size, scaled version of --const-font-size                                                           |
| --a11y-btn-font-size            | Button font-size, scaled version of --const-btn-font-size                                                        |
| --a11y-icon-font-size-lg        | Icon font-size, scaled version of --const-icon-font-size-lg                                                      |
| --a11y-drawer-header-font-size  | Sidebar header font-size                                                                                         |
| --const-segmented-bar-font-size | Base font size used by the segmented bar                                                                         |
| --const-segmented-bar-height    | Base height of the segmented bar                                                                                 |
| --a11y-segmented-bar-font-size  | SegmentedBar font-size, scaled version of --const-segmented-bar-font-size                                        |
| --a11y-segmented-bar-height     | SegmentedBar height, scaled version of --const-segmented-bar-height                                              |
| --const-drawer-header-font-size | Base SideDrawer header font-size                                                                                 |
| --a11y-drawer-header-font-size  | SideDrawer header font-size, scaled version of --const-drawer-header-font-size                                   |
| --a11y-{text-class-name}-size   | Scaled font-size variable for the text CSS-classes `t-10`...`t-36`, `h1`...`h6`, `body`, `body2` and `footnote`. |

```scss
.my-class {
  height: calc(40 * var(--a11y-fontscale-factor));
  margin: calc(2 * var(--a11y-fontscale-factor));
  font-size: calc(16 * var(--a11y-fontscale-factor));
}
```
