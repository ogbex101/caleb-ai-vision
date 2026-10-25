import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// jsdom implements neither observer, and framer-motion's whileInView needs
// IntersectionObserver to reveal anything. Without this stub every section
// that animates in stays at opacity 0 and no test can see its content.
class StubObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}

Object.defineProperty(window, "IntersectionObserver", { writable: true, value: StubObserver });
Object.defineProperty(globalThis, "IntersectionObserver", { writable: true, value: StubObserver });
Object.defineProperty(window, "ResizeObserver", { writable: true, value: StubObserver });
Object.defineProperty(globalThis, "ResizeObserver", { writable: true, value: StubObserver });

// Not implemented in jsdom; the preview cards call it on click.
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => {};
