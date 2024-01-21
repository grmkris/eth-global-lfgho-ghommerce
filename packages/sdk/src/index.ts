// https://bun.sh/docs/typescript#dom-types
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { createTRPCProxyClient } from "@trpc/client";
import { windowLink } from "trpc-browser/link";
import { createIframe, hideIframeModal, showIframeModal } from "./iframe.ts";
import {
  HelloSdkInput,
  HelloSdkOutput,
  initTrpcWindowHandler,
} from "./router.ts";
import type { IframeRouter } from "ghommerce/src/trpc.ts";

export type Actions = {
  onHelloWorld: (
    props: HelloSdkInput,
  ) => Promise<HelloSdkOutput> | HelloSdkOutput;
};

let iframe: HTMLIFrameElement | null = null;
export let actions: Actions | null = null;

/**
 * Iframe SDK
 */
export const GhommerceSDK = async (props: {
  url: string;
  actions: Actions;
}) => {
  actions = props.actions;
  initTrpcWindowHandler();
  iframe = createIframe({
    url: props.url,
  });
  if (!iframe?.contentWindow)
    throw new Error("Iframe has not been initialized.");

  const iframeClient = getTrpcClientIframe(iframe.contentWindow);
  return {
    iframeClient,
    showIframeModal: () => {
      if (!iframe) throw new Error("Iframe has not been initialized.");
      showIframeModal(iframe);
    },
    hideIframeModal: () => {
      if (!iframe) throw new Error("Iframe has not been initialized.");
      hideIframeModal(iframe);
    },
  };
};

/**
 * Initializes the TRPC client for a given iframe window.
 * With this client we can call the procedures on the iframe from the host.
 * @param iframeWindow - The window object of the iframe.
 * @returns The TRPC client.
 */
export const getTrpcClientIframe = (iframeWindow: Window) => {
  return createTRPCProxyClient<IframeRouter>({
    links: [
      windowLink({
        window: window,
        postWindow: iframeWindow,
        postOrigin: "*", // TODO: Narrow down this origin for security
      }),
    ],
  });
};
