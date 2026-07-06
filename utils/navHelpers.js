// utils/navHelpers.js
// router.back() throws "GO_BACK was not handled by any navigator" when there's no
// history to pop — which happens on any of the 5 bottom-nav tab screens, since
// BottomNavBar switches tabs with router.replace() (to avoid stacking tab history),
// which can leave a tab screen with nothing behind it. Falls back to Home instead.

export const safeGoBack = (router, fallback = '/screens/HomeScreen') => {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
};
