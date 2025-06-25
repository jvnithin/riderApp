// android/app/src/main/java/com/yourapp/ForegroundServiceModule.java
package com.ridercli;

import com.supersami.foregroundservice.ForegroundServiceModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import androidx.annotation.NonNull;
public class CustomForegroundServiceModule extends ForegroundServiceModule {
  public CustomForegroundServiceModule(ReactApplicationContext ctx) {
    super(ctx);
  }

  @ReactMethod
  public void addListener(String eventName) {
    // Stub to satisfy RN EventEmitter contract
  }

  @ReactMethod
  public void removeListeners(Integer count) {
    // Stub to satisfy RN EventEmitter contract
  }

  // Add or override any other methods here
}

