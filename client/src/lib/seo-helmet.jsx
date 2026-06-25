import { useEffect } from 'react';
import { Children, isValidElement } from 'react';

/*
 * Dependency-free drop-in replacement for react-helmet-async.
 *
 * react-helmet-async (both 1.x and 2.x) silently fails to commit head tags
 * in this Vite + React 18 app (no error, no DOM update), leaving every route
 * stuck on the static index.html <title> and dropping the Product JSON-LD.
 * This shim implements the same <HelmetProvider>/<Helmet> API used across the
 * app by writing <title>/<meta>/<link>/<script> into document.head inside an
 * effect and reverting the changes on cleanup so per-route tags never leak.
 *
 * It is wired in via a Vite alias (resolve.alias['react-helmet-async']), so
 * existing `import { Helmet, HelmetProvider } from 'react-helmet-async'`
 * statements keep working unchanged.
 */

export const HelmetProvider = ({ children }) => children;

const textOf = (children) => {
    if (typeof children === 'string') return children;
    if (typeof children === 'number') return String(children);
    if (Array.isArray(children)) return children.map(textOf).join('');
    return '';
};

export function Helmet({ children }) {
    useEffect(() => {
        const head = document.head;
        const cleanups = [];

        Children.toArray(children)
            .filter(isValidElement)
            .forEach((el) => {
                const { type, props } = el;

                if (type === 'title') {
                    const prev = document.title;
                    const next = textOf(props.children);
                    if (next) document.title = next;
                    cleanups.push(() => {
                        document.title = prev;
                    });
                    return;
                }

                if (type === 'meta') {
                    const selector = props.name
                        ? `meta[name="${props.name}"]`
                        : props.property
                            ? `meta[property="${props.property}"]`
                            : null;
                    const existing = selector ? head.querySelector(selector) : null;
                    if (existing) {
                        const prevContent = existing.getAttribute('content');
                        if (props.content != null) existing.setAttribute('content', String(props.content));
                        cleanups.push(() => {
                            if (prevContent == null) existing.removeAttribute('content');
                            else existing.setAttribute('content', prevContent);
                        });
                    } else {
                        const node = document.createElement('meta');
                        if (props.name) node.setAttribute('name', props.name);
                        if (props.property) node.setAttribute('property', props.property);
                        if (props.content != null) node.setAttribute('content', String(props.content));
                        node.setAttribute('data-rh', 'true');
                        head.appendChild(node);
                        cleanups.push(() => node.remove());
                    }
                    return;
                }

                if (type === 'link') {
                    const existing =
                        props.rel === 'canonical' ? head.querySelector('link[rel="canonical"]') : null;
                    if (existing) {
                        const prevHref = existing.getAttribute('href');
                        if (props.href != null) existing.setAttribute('href', String(props.href));
                        cleanups.push(() => {
                            if (prevHref == null) existing.removeAttribute('href');
                            else existing.setAttribute('href', prevHref);
                        });
                    } else {
                        const node = document.createElement('link');
                        Object.entries(props).forEach(([k, v]) => {
                            if (k !== 'children' && v != null) node.setAttribute(k, String(v));
                        });
                        node.setAttribute('data-rh', 'true');
                        head.appendChild(node);
                        cleanups.push(() => node.remove());
                    }
                    return;
                }

                if (type === 'script') {
                    const node = document.createElement('script');
                    if (props.type) node.setAttribute('type', props.type);
                    if (props.src) node.setAttribute('src', String(props.src));
                    const txt = textOf(props.children);
                    if (txt) node.textContent = txt;
                    node.setAttribute('data-rh', 'true');
                    head.appendChild(node);
                    cleanups.push(() => node.remove());
                }
            });

        return () => cleanups.forEach((fn) => fn());
    });

    return null;
}

export default Helmet;
