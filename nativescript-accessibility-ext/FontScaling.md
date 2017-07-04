# Scalíng fonts in your application

Problem:
You need to support users with a visual impairment that requires larger fonts.

You can solve this in a number of ways.

## Using: Label.accessibilityAdjustsFontSize (iOS only)
On Android Labels are already scaled, so you don't need to do anything here.

On iOS you can set the property **accessibilityAdjustsFontSize** on a Label, to have the text scale automatically.
This is similar to iOS 10+ **adjustsFontForContentSizeCategory** expect that it works on all fonts, not just a few named fonts.
It works by listening to the Label's font scale and iOS' setting for the font scaling, unfortunately this causes a visible delay
and the UI height is always updated. This causes the UI to jump.

## Using stylesheets.
**nativescript-theme-core** provides CSS classes for standardized font-sizes.
`.t-NN, .hN, .body, .body2... etc`

**@nota/nativescript-accessibility-ext** provides extends theses classes, by setting an approchiate CSS-class on the Page.

To use it all you need to do is add this to your `app.ios.scss`:

```scss
import '@nota/nativescript-accessibility-ext/scss/a11y.ios';
```

And add this to your `app.android.scss`:

```scss
import '@nota/nativescript-accessibility-ext/scss/a11y.android';
```

If you need to add your own styles, you can do it like this:

```scss
import '@nota/nativescript-accessibility-ext/scss/fontscales';

$my-custom-font-size: 16;
@each $scale, $params in $a11y-font-scales {
  $factor: map-get($params, factor);
  Page.a11y-fontscale-#{$scale} {
    .my-class {
      font-size: $my-custom-font-size: * $factor;
    }
  }
}

```

If you're adding it to an nativescript-angular component, add this to your component.css:

```scss
import '@nota/nativescript-accessibility-ext/scss/fontscales';

$my-custom-font-size: 16;
@each $scale, $params in $a11y-font-scales {
  $factor: map-get($params, factor);
  /deep/ Page.a11y-fontscale-#{$scale} {
    .my-class {
      font-size: $my-custom-font-size: * $factor;
    }
  }
}

```
