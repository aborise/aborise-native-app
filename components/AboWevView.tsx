// return webview and pass through all props

import { ForwardedRef, Ref, forwardRef, useImperativeHandle, useRef } from 'react';
import WebView, { WebViewMessageEvent, WebViewProps } from 'react-native-webview';
import { WebViewNativeEvent } from 'react-native-webview/lib/RNCWebViewNativeComponent';

type addMessageHandler = (cb: (event: WebViewMessageEvent) => void) => void;
type removeMessageHandler = (cb: (event: WebViewMessageEvent) => void) => void;

export interface AboWebViewRef extends WebView {
  addMessageHandler: addMessageHandler;
  removeMessageHandler: removeMessageHandler;
}

const AboWebView = forwardRef<AboWebViewRef>((props: WebViewProps, ref) => {
  const onMessage = (event: WebViewMessageEvent) => {
    handlers.forEach((cb) => cb(event));
    props.onMessage && props.onMessage(event);
  };

  const handlers: Array<(event: WebViewMessageEvent) => void> = [];

  const addMessageHandler = (cb: (event: WebViewMessageEvent) => void) => {
    handlers.push(cb);
  };

  const removeMessageHandler = (cb: (event: WebViewMessageEvent) => void) => {
    const index = handlers.indexOf(cb);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  };

  useImperativeHandle(
    ref,
    () =>
      ({
        addMessageHandler,
        removeMessageHandler,
      } as AboWebViewRef),
  );

  return <WebView {...props} onMessage={onMessage} ref={ref as ForwardedRef<WebView>} />;
});
