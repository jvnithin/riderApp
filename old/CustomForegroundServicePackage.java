package com.ridercli;

import java.util.Arrays;
import java.util.List;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

public class CustomForegroundServicePackage implements ReactPackage {
  @Override
  public List<NativeModule> createNativeModules(ReactApplicationContext ctx) {
    return Arrays.<NativeModule>asList(new CustomForegroundServiceModule(ctx));
  }

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
    return Arrays.asList();
  }
}
