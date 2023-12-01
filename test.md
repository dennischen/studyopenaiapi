# Client Component佈景主題支援

`Theme`這個功能, 提供了一個導入佈景主題物件, 及提供頁面存取該主題資料的架構. 這個功能並不制定過多主題資格物件格式, 不論是變數, 樣式或是呼叫方法, 由你自行設計發揮.

## 取得佈景主題
[[page.tsx](https://github.com/dennischen/nextspace-demo/blob/master/src/app/demo/theme/page.tsx)]

使用`useTheme()`取得`Theme`, 存取成員變數`themepack`來取得你定義的佈景主題資料.

```tsx
const theme = useTheme()
const themepack = theme.themepack as DemoThemepack
```